import {transform} from "babel";
import optimist from "optimist";
import path from "path";
import fsutils from "../../../utils/fs";
import { print, getLogger } from "../../../utils/logging";

var argv = optimist.argv;

var transpile = function(siteConfig) {
    var logger = getLogger(siteConfig.quiet, "transpile");
    var taskConfig = siteConfig.tasks.transpile;

    var fn = function() {
        var extensions = siteConfig.js_extensions.map(e => `*.${e}`);
        var excluded = [siteConfig.destination]
            .concat(siteConfig.dirs_client_vendor)
            .concat(siteConfig.dirs_exclude)
            .map(dir => `!${dir}/`)
            .concat(siteConfig.patterns_exclude);

        var transpiledFiles = [];

        var makeOutputDir = function*(outputPath) {
            var outputDir = path.dirname(outputPath);
            if (!(yield* fsutils.exists(outputDir))) {
                yield* fsutils.mkdirp(outputDir);
            }
        };

        //We compile client, dev build separately because they may have different blacklists.
        //  For example, on iojs we want to blacklist regenerator. But on the client, we don't.
        this.watch(extensions.concat(excluded), function*(filePath, ev, match) {
            transpiledFiles.push(filePath);

            //Make the output dir, if it doesn't exist
            var outputPath = fsutils.changeExtension(
                path.join(siteConfig.destination, filePath),
                [ { to:"js", from: siteConfig.js_extensions }]
            );
            yield* makeOutputDir(outputPath);

            var contents = yield* fsutils.readFile(filePath);

            var result = transform(contents, { blacklist: taskConfig.blacklist });
            yield* fsutils.writeFile(outputPath, result.code);

            if (argv.verbose)
                print(`${filePath} -> ${outputPath}`, "transpile");
        }, "babel_em_all");

        this.onComplete(function*() {
            logger(`rewrote ${transpiledFiles.length} files`);
        });
    };

    return { build: true, fn: fn };
};

export default transpile;
