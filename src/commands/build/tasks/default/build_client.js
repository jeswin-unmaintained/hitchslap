/*
    This is where we package stuff for the client build.
    So, we copy all the transpiled js code into the client (dir_client_build) and client (dir_dev_build) directories.
*/

import path from "path";
import webpack from "webpack";
import generatorify from "nodefunc-generatorify";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

var buildClient = function(siteConfig) {
    /*
        Copy everything that is not a markdown or yml file.
    */

    var logger = getLogger(siteConfig.quiet, "build_client");
    var taskConfig = siteConfig.tasks.build_client;

    var fn = function() {
        var extensions = [`${siteConfig.source}/*.js`, `${siteConfig.source}/*.json`];
        var excluded = siteConfig.dirs_exclude
            .concat(siteConfig.destination)
            .concat(siteConfig.dirs_client_vendor.map(dir => `${siteConfig.destination}/${dir}`))
            .map(dir => `!${dir}/`)
            .concat(siteConfig.patterns_exclude);

        //Copy filePath into destDir
        var copyFile = function*(filePath, destDir) {
            //Get the relative filePath by removing the monitored directory (siteConfig.source)
            var relativeFilePath = filePath.substring(siteConfig.source.length);
            var clientDest = path.join(siteConfig.destination, destDir, relativeFilePath);
            yield* fsutils.copyFile(filePath, clientDest, { createDir: true });
        };

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
                2. Original filename.js will then be renamed filename_base.js
                3. filename~client.js will longer exist, since it was moved.

                The same rules apply for "dev", "test" and other builds.
        */
        var replaceFiles = function*(files, suffix, build) {
            for (let file of files) {
                //file is the path to the source js file, which needs to be copied into dir_client_build and dir_dev_build
                //  ie, /some_dir/abc.js to /some_dir/js/abc.js
                var relativeFilePath = file.substring(siteConfig.source.length);
                var filePath = path.join(siteConfig.destination, build, relativeFilePath);

                var extension = /\.js$/.test(file) ? "js" : "json";
                var regex = new RegExp(`${suffix}\\.${extension}$`);

                let original = filePath.replace(regex, `.${extension}`);
                let renamed = original.replace(/\.js$/, `_base.${extension}`);

                let originalContents = yield* fsutils.readFile(original);
                yield* fsutils.writeFile(renamed, originalContents);

                let overriddenContents = yield* fsutils.readFile(filePath);
                yield* fsutils.writeFile(original, overriddenContents);

                //Remove abc~client.js and abc~dev.js, as the case may be.
                yield* fsutils.remove(filePath);

                var config = {
                    entry: [path.join(siteConfig.destination, build, siteConfig.entry_point)],
                    module: {
                        loaders: [ { test: /\.(js|jsx)$/, exclude: /node_modules/, loader: 'babel?experimental&optional=runtime' }]
                    },
                    output: {
                        filename: path.join(siteConfig.destination, build, "app.bundle.js")
                    }
                };

                var compiler = webpack(config);
                var runner = generatorify(compiler.run.bind(compiler));
                var stats = yield* runner();
                logger(`packed app files into app.bundle.js`);
            }
        };

        this.onComplete(function*() {
            yield* replaceFiles(clientSpecificFiles, siteConfig.client_js_suffix, siteConfig.dir_client_build);
            if (siteConfig.build_dev)
                yield* replaceFiles(devSpecificFiles, siteConfig.dev_js_suffix, siteConfig.dir_dev_build);
        });
    };

    return { build: true, fn: fn };
};

export default buildClient;
