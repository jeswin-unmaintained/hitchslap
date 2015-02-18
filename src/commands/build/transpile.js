import babel from "babel";
import fsutils from "../../utils/fs";
import optimist from "optimist";
import path from "path";

var argv = optimist.argv;

export default function(siteConfig) {
    var blacklist = argv["transpiler-blacklist"] ? [].concat(argv["transpiler-blacklist"]) : [];

    return function() {
        var excluded = ["node_modules", "_vendor", "_site"]
            .map(dir => { return { dir, exclude: "directory" }; });

        this.watch(["*.js", "*.jsx"].concat(excluded), function*(filePath, ev, match) {
            var outputPath = path.join(siteConfig.destination, filePath).replace(/\.jsx$/, ".js");
            var outputDir = path.dirname(outputPath);
            if (!(yield* fsutils.exists(outputDir))) {
                yield* fsutils.mkdirp(outputDir);
            }
            var contents = yield* fsutils.readFile(filePath);
            var result = babel.transform(contents, { blacklist });
            yield* fsutils.writeFile(outputPath, result.code);
        }, "babel_js_jsx");
    };
}
