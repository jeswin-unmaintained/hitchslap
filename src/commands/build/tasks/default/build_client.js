/*
    This is where we package stuff for the client build.
    So, we copy all the transpiled js code into the client (dir_client_build) and client (dir_dev_build) directories.
*/

import path from "path";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

export default function(siteConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */

    var logger = getLogger(siteConfig.quiet, "build_client");
    var taskConfig = siteConfig.tasks.build_client;

    var fn = function() {
        var extensions = [
            `${siteConfig.destination}/*.js`,
            `!${siteConfig.destination}/${siteConfig.dir_client_build}/`,
            `!${siteConfig.destination}/${siteConfig.dir_dev_build}/`,
            `!${siteConfig.destination}/${siteConfig.dir_custom_tasks}/`,
        ].concat(
            siteConfig.dirs_client_vendor.map(dir => `!${siteConfig.destination}/${dir}/`)
        );

        var copyFile = function*(filePath, destDir) {
            var relativeFilePath = filePath.substring(siteConfig.destination.length);
                var clientDest = path.join(siteConfig.destination, destDir, relativeFilePath);
            var clientDestDir = path.dirname(clientDest);
            if (!(yield* fsutils.exists(clientDestDir)))
                yield* fsutils.mkdirp(clientDestDir);
            yield* fsutils.copyFile(filePath, clientDest);
        };

        this.watch(extensions, function*(filePath, ev, matches) {
            yield* copyFile(filePath, siteConfig.dir_client_build);

            if (taskConfig.dev) {
                yield* copyFile(filePath, siteConfig.dir_dev_build);
            }
        }, "build_client");

        this.onComplete(function*() {
        });
    };

    return { build: true, fn: fn };
}
