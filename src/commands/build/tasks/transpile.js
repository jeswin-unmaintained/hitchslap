import {transform} from "babel";
import optimist from "optimist";
import path from "path";
import fsutils from "../../../utils/fs";
import { print, getLogger } from "../../../utils/logging";

var argv = optimist.argv;

export default function(siteConfig) {
    var logger = getLogger(siteConfig, "transpile");
    var taskConfig = siteConfig.tasks.transpile;

    var blacklist = argv["transpiler-blacklist"] ? [].concat(argv["transpiler-blacklist"]) : [];

    var fn = function() {
        var excluded = [siteConfig.destination, "node_modules"]
            .concat(taskConfig.exclude_dirs)
            .map(dir => `!${dir}/`);

        var transpiledFiles = [];
        this.watch(["*.js", "*.jsx"].concat(excluded), function*(filePath, ev, match) {
            transpiledFiles.push(filePath);
            var outputPath = path.join(siteConfig.destination, filePath).replace(/\.jsx$/, ".js");
            var outputDir = path.dirname(outputPath);
            if (!(yield* fsutils.exists(outputDir))) {
                yield* fsutils.mkdirp(outputDir);
            }
            var contents = yield* fsutils.readFile(filePath);
            var result = transform(contents, { blacklist });
            yield* fsutils.writeFile(outputPath, result.code);
        }, "babel_js_jsx");

        this.onComplete(function*() {
            logger(`rewrote ${transpiledFiles.length} files`);
        });
    };

    return { build: true, fn: fn };
}
