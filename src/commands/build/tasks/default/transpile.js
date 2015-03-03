import babel from "babel";
import optimist from "optimist";
import path from "path";
import fsutils from "../../../../utils/fs";

var argv = optimist.argv;

export default function(siteConfig) {
    var blacklist = argv["transpiler-blacklist"] ? [].concat(argv["transpiler-blacklist"]) : [];

    return function() {
        var excluded = ["destination", "dir_client_js"]
            .map(k => siteConfig[k])
            .concat("node_modules")
            .map(dir => `!${dir}/`);

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
