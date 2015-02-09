var crankshaft = require("crankshaft");
var path = require("path");
var fs = require("fs");
var tools = require("crankshaft-tools");
var to5 = require("6to5");
var generatorify = require("nodefunc-generatorify");
var extfs = require('extfs');
var _mkdirp = require("mkdirp");

var readFile = generatorify(fs.readFile);
var rmdir = generatorify(extfs.remove);
var mkdirp = generatorify(_mkdirp);
var exists = generatorify(function(what, cb) {
    fs.exists(what, function(exists) {
        cb(null, exists);
    });
});

var build = crankshaft.create();

build.onStart(function*() {
    if (yield* exists("lib"))
        yield* rmdir("lib");
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
    });

    /*
        Copy everything except js and jsx.
    */
    this.watch(["src/*.*", "!src/*.js", "!src/*.jsx"], function*(filePath, ev, match) {
        var outputPath = filePath.replace(/^src\//, "lib/");
        var outputDir = path.dirname(outputPath);
        if (!(yield* exists(outputDir))) {
            yield* mkdirp(outputDir);
        }
        fs.createReadStream(filePath).pipe(fs.createWriteStream(outputPath));
    });

}, ".");

build.start();
