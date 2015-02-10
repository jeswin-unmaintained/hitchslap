var crankshaft = require("crankshaft");
var path = require("path");
var fs = require("fs");
var tools = require("crankshaft-tools");
var to5 = require("6to5");
var generatorify = require("nodefunc-generatorify");
var extfs = require('extfs');
var _mkdirp = require("mkdirp");
var ncp = generatorify(require("ncp"));

var mkdir = generatorify(fs.mkdir);
var readFile = generatorify(fs.readFile);
var rmdir = generatorify(extfs.remove);
var mkdirp = generatorify(_mkdirp);
var exists = generatorify(function(what, cb) {
    fs.exists(what, function(exists) {
        cb(null, exists);
    });
});

var build = crankshaft.create();

/*
    Remove the lib directory if it exists.
*/
build.onStart(function*() {
    if (yield* exists("lib"))
        yield* rmdir("lib");

    /*
        Copy vendor libs
    */
    yield* mkdirp("lib/site_template/node_modules");
    yield* ncp("src/site_template/node_modules/", "lib/site_template/node_modules/");

    yield* mkdirp("lib/site_template/vendor");
    yield* ncp("src/site_template/vendor/", "lib/site_template/vendor/");
});

build.configure(function() {
    /*
        Transpile js and jsx with 6to5.
    */
    this.watch(["src/*.js", "src/*.jsx", "!src/site_template/node_modules/*.*", "!src/site_template/vendor/*.*"], function*(filePath, ev, match) {
        var outputPath = filePath.replace(/^src\//, "lib/").replace(/\.jsx$/, ".js");
        var outputDir = path.dirname(outputPath);
        if (!(yield* exists(outputDir))) {
            yield* mkdirp(outputDir);
        }
        var contents = yield* readFile(filePath);
        var result = to5.transform(contents, { blacklist: "regenerator" });
        fs.writeFile(outputPath, result.code);
    }, "to5_js_jsx");

    /*
        Copy everything except js and jsx.
    */
    this.watch(["src/*.*", "!src/*.js", "!src/*.jsx", "!src/site_template/node_modules/*.*", "!src/site_template/vendor/*.*"], function*(filePath, ev, match) {
        var outputPath = filePath.replace(/^src\//, "lib/");
        var outputDir = path.dirname(outputPath);
        if (!(yield* exists(outputDir))) {
            yield* mkdirp(outputDir);
        }
        fs.createReadStream(filePath).pipe(fs.createWriteStream(outputPath));
    }, "copy_all");

}, ".");

build.start();
