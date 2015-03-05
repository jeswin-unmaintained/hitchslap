import less from "less";
import path from "path";
import fsutils from "../../../../utils/fs";
import generatorify from "nodefunc-generatorify";
import { print, getLogger } from "../../../../utils/logging";

var lessc = generatorify(less.render.bind(less));

export default function(siteConfig) {

    var logger = getLogger(siteConfig, "less");
    var taskConfig = siteConfig.tasks.less;

    var fn = function() {
        this.watch(
            [`${taskConfig.dirs}/*.less`, `!${taskConfig.dirs}/includes/*.less`],
            function*(filePath, ev, match) {
                var outputPath = path.join(siteConfig.destination, filePath).replace(/\.less$/, ".css");
                var outputDir = path.dirname(outputPath);
                if (!(yield* fsutils.exists(outputDir))) {
                    yield* fsutils.mkdirp(outputDir);
                }
                var contents = yield* fsutils.readFile(filePath);
                if (contents) {
                    var result = yield* lessc(contents);
                    yield* fsutils.writeFile(outputPath, result.css);
                }
                logger(`compiled ${filePath} to ${outputPath}`);
            },
            "less_compile"
        );
    };

    return { build: true, fn: fn };
}
