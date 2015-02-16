import to5 from "6to5";
import fsutils from "../../utils/fs";
import optimist from "optimist";
import path from "path";

var argv = optimist.argv;

export default function(siteConfig) {
    var blacklist = argv["transpiler-blacklist"] ? [].concat(argv["transpiler-blacklist"]) : [];

    return function() {
        var excluded = [{ dir: "vendor", exclude: "directory" }, { dir: "_site", exclude: "directory" }];
        this.watch(["*.js", "*.jsx"].concat(excluded), function*(filePath, ev, match) {
            var outputPath = path.join(siteConfig.destination, filePath).replace(/\.jsx$/, ".js");
            console.log(outputPath);
            var outputDir = path.dirname(outputPath);
            if (!(yield* fsutils.exists(outputDir))) {
                yield* fsutils.mkdirp(outputDir);
            }
            var contents = yield* fsutils.readFile(filePath);
            var result = to5.transform(contents, { blacklist });
            yield* fsutils.writeFile(outputPath, result.code);
        }, "to5_js_jsx");
    };
}
