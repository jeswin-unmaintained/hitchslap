import path from "path";
import fs from "fs";
import generatorify from "nodefunc-generatorify";
import fsutils from "../../../utils/fs";
import { tryRead } from "../../../utils/config";
import { print, getLogger } from "../../../utils/logging";
import optimist from "optimist";
import browserify from "browserify";
import babelify from "babelify";
import exposify from "exposify";

let argv = optimist.argv;

/*
    options: {
        source: string,
        destination: string,
        clientBuildDirectory: string,
        appEntryPoint: string,
        bundleName: string,
        extensions: [string],
        debug: bool,
        globalModules: [string],
        excludedModules: [string],
        clientJSSuffix: string,
        originalJSSuffix: string,
        blacklist: [string]
        excludedDirectories: [string],
        excludedPatterns: [regex or string],
        excludedWatchPatterns = [regex],
        quiet: bool
    }
*/

let buildClient = function(name, options) {
    let logger = getLogger(options.quiet, name || "build-client");

    //defaults
    options.extensions = options.extensions || ["js", "jsx", "json"];
    options.excludedDirectories = options.excludedDirectories || [options.destination];
    options.excludedPatterns = (options.excludedPatterns || [])
        .map(p => typeof p === "string" ? new RegExp(p) : p);
    options.blacklist = options.blacklist || [];
    options.excludedWatchPatterns = options.excludedWatchPatterns || [];

    //Copy file into destDir
    let copyFile = function*(filePath, root) {
        //Get the relative filePath by removing the monitored directory (options.source)
        let originalPath = path.join(root, filePath);
        let clientPath = path.join(options.destination, options.clientBuildDirectory, filePath);
        //We might have some jsx files. Switch extension to js.
        let pathWithFixedExtension = fsutils.changeExtension(clientPath, options.changeExtensions);
        yield* fsutils.copyFile(originalPath, pathWithFixedExtension, { createDir: true });
    };

    let fn = function() {
        let extensions = options.extensions.map(e => `*.${e}`);

        let excluded = options.excludedDirectories
            .map(dir => `!${dir}/`)
            .concat(options.excludedPatterns);

        let clientSpecificFiles = [];

        this.watch(extensions.concat(excluded), function*(filePath, ev, matches) {
            if (!options.excludedWatchPatterns.some(regex => regex.test(filePath))) {
                let clientFileRegex = new RegExp(`${options.clientJSSuffix}\.(js|json)$`);

                if (clientFileRegex.test(filePath)) {
                    clientSpecificFiles.push(filePath);
                }

                yield* copyFile(filePath, this.root);
            }
        }, "build-client");


        /*
            Rules:
                1. In the client build, filename~client.js will be moved to filename.js
                2. Original filename.js will then be renamed filename_base.js (_base is configurable via options.originalJSSuffix)
                3. filename~client.js will longer exist, since it was moved.

                The same rules apply for "dev", "test" and other builds.
        */
        let replaceFiles = function*(files) {
            for (let file of files) {
                let filePath = path.join(options.destination, options.clientBuildDirectory, file);

                let extension = /\.js$/.test(file) ? "js" : "json";
                let regex = new RegExp(`${options.clientJSSuffix}\\.${extension}$`);

                let original = filePath.replace(regex, `.${extension}`);
                let renamed = original.replace(/\.js$/, `${options.originalJSSuffix}.${extension}`);

                let originalContents = yield* fsutils.readFile(original);
                yield* fsutils.writeFile(renamed, originalContents);

                let overriddenContents = yield* fsutils.readFile(filePath);
                yield* fsutils.writeFile(original, overriddenContents);

                //Remove abc~client.js and abc~dev.js, as the case may be.
                yield* fsutils.remove(filePath);
            }
        };


        /*
            Create the client and dev builds with browserify.
            Take the entry point from options, which defaults to app.js
        */
        let browserifyFiles = function*() {
            let entry = path.join(options.destination, options.clientBuildDirectory, options.appEntryPoint);
            let output = path.join(options.destination, options.clientBuildDirectory, options.bundleName);

            let b = browserify([entry], { debug: options.debug });

            options.excludedModules.concat(Object.keys(options.globalModules)).forEach(function(e) {
                b = b.external(e);
            });

            var r = b.transform(babelify.configure({ blacklist: options.blacklist }), { global: true })
                .transform(exposify, { expose: options.globalModules, global: true })
                .bundle()
                .pipe(fs.createWriteStream(output));

            yield* generatorify(function(cb) {
                r.on("finish", cb);
            })();
        };


        this.onComplete(function*() {
            //Make the client build
            yield* replaceFiles(clientSpecificFiles);
            yield* browserifyFiles();
            logger(`Wrote ${options.bundleName}`);
            clientSpecificFiles = [];
        });
    };

    return { build: true, fn: fn };
};

export default buildClient;
