import less from "less";
import path from "path";
import fsutils from "../../../utils/fs";
import generatorify from "nodefunc-generatorify";
import { print, getLogger } from "../../../utils/logging";

let lessc = generatorify(less.render.bind(less));

let compileLess = function(siteConfig, buildConfig, taskConfig) {

    let logger = getLogger(siteConfig.quiet, "less");

    let watchPattern = Array.prototype.concat.apply([], taskConfig.dirs.map(dir => [`${dir}/*.less`, `!${dir}/includes/*.less`]));
    let fn = function() {
        this.watch(
            watchPattern,
            function*(filePath, ev, match) {
                let outputPath = path.join(siteConfig.destination, filePath).replace(/\.less$/, ".css");
                let outputDir = path.dirname(outputPath);
                if (!(yield* fsutils.exists(outputDir))) {
                    yield* fsutils.mkdirp(outputDir);
                }
                let contents = yield* fsutils.readFile(filePath);
                if (contents) {
                    let result = yield* lessc(contents);
                    yield* fsutils.writeFile(outputPath, result.css);
                }
                logger(`compiled ${filePath} to ${outputPath}`);
            },
            "less_compile"
        );
    };

    return { build: true, fn: fn };
};

export default compileLess;
