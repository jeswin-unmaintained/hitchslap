/*
    We compile js files which:
        a) Run in the browser
        b) Are runnable in dev mode in the browser

        The difference between these two is that dev mode requires isomorphic versions of all files on the server.
        But in client mode, we may perhaps not need the database access modules.
*/

import path from "path";
import webpack from "webpack";
import generatorify from "nodefunc-generatorify";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

var buildClient = function(siteConfig) {

    var logger = getLogger(siteConfig.quiet, "build_client");
    var taskConfig = siteConfig.tasks.build_client;

    //Copy file into destDir
    var copyFile = function*(filePath, destDir) {
        //Get the relative filePath by removing the monitored directory (siteConfig.source)
        var relativeFilePath = filePath.substring(siteConfig.source.length);
        var clientDest = path.join(siteConfig.destination, destDir, relativeFilePath);
        yield* fsutils.copyFile(filePath, clientDest, { createDir: true });
    };

    var fn = function() {
        var extensions = [`${siteConfig.source}/*.js`, `${siteConfig.source}/*.json`];

        var excluded = siteConfig.dirs_exclude
            .concat(siteConfig.destination)
            .concat(siteConfig.dirs_client_vendor.map(dir => `${siteConfig.destination}/${dir}`))
            .map(dir => `!${dir}/`)
            .concat(siteConfig.patterns_exclude);


        var clientSpecificFiles = [];
        var devSpecificFiles = [];

        this.watch(extensions.concat(excluded), function*(filePath, ev, matches) {
            if (new RegExp(`${siteConfig.client_js_suffix}\.(js|json)$`).test(filePath)) {
                clientSpecificFiles.push(filePath);
            }
            yield* copyFile(filePath, siteConfig.dir_client_build);

            if (siteConfig.build_dev) {
                if (new RegExp(`${siteConfig.dev_js_suffix}\.(js|json)$`).test(filePath)) {
                    devSpecificFiles.push(filePath);
                }
                yield* copyFile(filePath, siteConfig.dir_dev_build);
            }
        }, "build_client");


        /*
            Rules:
                1. In the client build, filename~client.js will be moved to filename.js
                2. Original filename.js will then be renamed filename_base.js (_base is configurable via siteConfig.original_js_suffix)
                3. filename~client.js will longer exist, since it was moved.

                The same rules apply for "dev", "test" and other builds.
        */
        var replaceFiles = function*(files, suffix, dir_client_build) {
            for (let file of files) {
                //file is the path to the source js file, which needs to be copied into dir_client_build and dir_dev_build
                //  ie, /some_dir/abc.js to /some_dir/js/abc.js
                var relativeFilePath = file.substring(siteConfig.source.length);
                var filePath = path.join(siteConfig.destination, dir_client_build, relativeFilePath);

                var extension = /\.js$/.test(file) ? "js" : "json";
                var regex = new RegExp(`${suffix}\\.${extension}$`);

                let original = filePath.replace(regex, `.${extension}`);
                let renamed = original.replace(/\.js$/, `${siteConfig.original_js_suffix}.${extension}`);

                let originalContents = yield* fsutils.readFile(original);
                yield* fsutils.writeFile(renamed, originalContents);

                let overriddenContents = yield* fsutils.readFile(filePath);
                yield* fsutils.writeFile(original, overriddenContents);

                //Remove abc~client.js and abc~dev.js, as the case may be.
                yield* fsutils.remove(filePath);
            }
        };


        /*
            Create the client and dev builds with webpack.
            Take the entry point from siteConfig, which defaults to app.js
        */
        var webpackFiles = function*(dir_client_build, bundleName) {
            var entry = path.join(siteConfig.destination, dir_client_build, siteConfig.entry_point);
            var output = path.join(siteConfig.destination, dir_client_build, bundleName);
            var config = {
                entry: [entry],
                module: {
                    loaders: [ { test: /\.(js|jsx)$/, loader: "babel-loader" }]
                },
                output: {
                    filename: output
                }
            };
            var compiler = webpack(config);
            var fnRun = generatorify(compiler.run);
            var stats = yield* fnRun.call(compiler);
            logger(`Packed js files into ${output}`);
        };

        this.onComplete(function*() {
            //Make the client build
            yield* replaceFiles(clientSpecificFiles, siteConfig.client_js_suffix, siteConfig.dir_client_build);
            yield* webpackFiles(siteConfig.dir_client_build, siteConfig.client_bundle_name);

            //Make the dev build
            if (siteConfig.build_dev) {
                yield* replaceFiles(devSpecificFiles, siteConfig.dev_js_suffix, siteConfig.dir_dev_build);
                yield* webpackFiles(siteConfig.dir_dev_build, siteConfig.dev_bundle_name);
            }
        });
    };

    return { build: true, fn: fn };
};

export default buildClient;
