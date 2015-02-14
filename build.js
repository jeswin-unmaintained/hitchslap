var crankshaft = require("crankshaft");
var path = require("path");
var fs = require("fs");
var tools = require("crankshaft-tools");
var to5 = require("6to5");
var generatorify = require("nodefunc-generatorify");
var extfs = require('extfs');
var _mkdirp = require("mkdirp");
var wrench = require("wrench");

var writeFile = generatorify(fs.writeFile);
var readFile = generatorify(fs.readFile);
var mkdirp = generatorify(_mkdirp);
var copyRecursive = generatorify(wrench.copyDirRecursive);
var build = crankshaft.create();
var exists = generatorify(function(what, cb) {
    fs.exists(what, function(exists) {
        cb(null, exists);
    });
});

/*
    Remove the lib directory if it exists.
*/
build.onStart(function*() {
    if (yield* exists("lib"))
        extfs.removeSync("lib");

    /*
        Copy directories that don't need any transpilation or processing.
        ie, node_modules and vendor libs
    */
    yield* mkdirp("lib/site_template/node_modules");
    yield* copyRecursive("src/site_template/node_modules", "lib/site_template/node_modules", { forceDelete: true });

    yield* mkdirp("lib/site_template/vendor");
    yield* copyRecursive("src/site_template/vendor", "lib/site_template/vendor", { forceDelete: true });

});

build.configure(function() {
    /*
        Transpile js and jsx with 6to5.
    */
    this.watch(["src/*.js", "src/*.jsx", { dir: "node_modules", exclude: "directory" },
            { dir: "src/site_template/vendor", exclude: "directory" }], function*(filePath, ev, match) {
        var outputPath = filePath.replace(/^src\//, "lib/").replace(/\.jsx$/, ".js");
        var outputDir = path.dirname(outputPath);
        if (!(yield* exists(outputDir))) {
            yield* mkdirp(outputDir);
        }
        var contents = yield* readFile(filePath);
        var result = to5.transform(contents, { blacklist: "regenerator" });
        yield* writeFile(outputPath, result.code);
    }, "to5_js_jsx");

    /*
        Copy everything except js and jsx.
    */
    this.watch(["src/*.*", "!src/*.js", "!src/*.jsx", { dir: "node_modules", exclude: "directory" },
                { dir: "src/site_template/vendor", exclude: "directory" }], function*(filePath, ev, match) {
        var outputPath = filePath.replace(/^src\//, "lib/");
        var outputDir = path.dirname(outputPath);
        if (!(yield* exists(outputDir))) {
            yield* mkdirp(outputDir);
        }
        fs.createReadStream(filePath).pipe(fs.createWriteStream(outputPath));
    }, "copy_all");

}, ".");

build.start()
    .catch(function(err) {
        console.log(err);
        console.log(err.stack);
    });
