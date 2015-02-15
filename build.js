var crankshaft = require("crankshaft");
var path = require("path");
var fs = require("fs");
var fsutils = require("./src/utils/fs");
var tools = require("crankshaft-tools");
var to5 = require("6to5");
var build = crankshaft.create();

/*
    Remove the lib directory if it exists.
*/
build.onStart(function*() {
    if (yield* fsutils.exists("lib"))
        fsutils.remove("lib");

    /*
        Copy directories that don't need any transpilation or processing.
        ie, node_modules and vendor libs
    */
    yield* fsutils.mkdirp("lib/site_template/node_modules");
    yield* fsutils.copyRecursive("src/site_template/node_modules", "lib/site_template/node_modules", { forceDelete: true });

    yield* fsutils.mkdirp("lib/site_template/vendor");
    yield* fsutils.copyRecursive("src/site_template/vendor", "lib/site_template/vendor", { forceDelete: true });

});

build.configure(function() {
    /*
        Transpile js and jsx with 6to5.
    */
    this.watch(["src/*.js", "src/*.jsx", { dir: "node_modules", exclude: "directory" },
            { dir: "src/site_template/vendor", exclude: "directory" }], function*(filePath, ev, match) {
        var outputPath = filePath.replace(/^src\//, "lib/").replace(/\.jsx$/, ".js");
        var outputDir = path.dirname(outputPath);
        if (!(yield* fsutils.exists(outputDir))) {
            yield* fsutils.mkdirp(outputDir);
        }
        var contents = yield* fsutils.readFile(filePath);
        var result = to5.transform(contents, { blacklist: "regenerator" });
        yield* fsutils.writeFile(outputPath, result.code);
    }, "to5_js_jsx");

    /*
        Copy everything except js and jsx.
    */
    this.watch(["src/*.*", "!src/*.js", "!src/*.jsx", { dir: "node_modules", exclude: "directory" },
                { dir: "src/site_template/vendor", exclude: "directory" }], function*(filePath, ev, match) {
        var outputPath = filePath.replace(/^src\//, "lib/");
        var outputDir = path.dirname(outputPath);
        if (!(yield* fsutils.exists(outputDir))) {
            yield* fsutils.mkdirp(outputDir);
        }
        fs.createReadStream(filePath).pipe(fs.createWriteStream(outputPath));
    }, "copy_all");

}, ".");

build.start()
    .catch(function(err) {
        console.log(err);
        console.log(err.stack);
    });
