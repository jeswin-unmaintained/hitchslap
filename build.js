var crankshaft = require("crankshaft");
var path = require("path");
var fs = require("fs");
var tools = require("crankshaft-tools");
var to5 = require("6to5");
var generatorify = require("nodefunc-generatorify");
var extfs = require('extfs');
var _mkdirp = require("mkdirp");
var fse = require("fs.extra");

var writeFile = generatorify(fs.writeFile);
var mkdir = generatorify(fs.mkdir);
var readFile = generatorify(fs.readFile);
var rmdir = generatorify(extfs.remove);
var mkdirp = generatorify(_mkdirp);
var exists = generatorify(function(what, cb) {
    fs.exists(what, function(exists) {
        cb(null, exists);
    });
});
var copyRecursive = generatorify(fse.copyRecursive);
var build = crankshaft.create();

/*
    Remove the lib directory if it exists.
*/
build.onStart(function*() {
    if (yield* exists("lib"))
        yield* rmdir("lib");

    /*
        Copy directories that don't need any transpilation or processing.
        ie, node_modules and vendor libs
    */
    yield* mkdirp("lib/site_template/node_modules");
    yield* copyRecursive("src/site_template/node_modules", "lib/site_template/node_modules");

    yield* mkdirp("lib/site_template/vendor");
    yield* copyRecursive("src/site_template/vendor", "lib/site_template/vendor");

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

build.start().then(function(err) { console.log(err); console.log(err.stack); });
