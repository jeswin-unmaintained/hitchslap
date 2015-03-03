import less from "less";
import path from "path";
import fsutils from "../../../utils/fs";
import generatorify from "nodefunc-generatorify";

var lessc = generatorify(less.render.bind(less));

export default function(siteConfig) {
    return function() {
        this.watch(
            [`${siteConfig.dir_css}/*.less`, `!${siteConfig.dir_css}/includes/*.less`],
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
            },
            "less_compile"
        );
    };
}
