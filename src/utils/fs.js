/*
    No ES6 allowed.
    This file is used by the build bootstrap.
*/

var fs = require("fs");
var generatorify = require("nodefunc-generatorify");
var extfs = require('extfs');
var _mkdirp = require("mkdirp");
var wrench = require("wrench");
var rimraf = require("rimraf");
var path = require("path");

var exists = generatorify(function(what, cb) {
    fs.exists(what, function(exists) {
        cb(null, exists);
    });
});

var empty = generatorify(function(path, cb) {
    extfs.isEmpty(path, function(result) {
        cb(null, result);
    });
});

var readFile = function*() {
    var fn = generatorify(fs.readFile);
    return (yield* fn.apply(null, arguments)).toString();
};

var copyFile = function(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
};

/*
    Changes the extension to toExtension
    If fromExtensions[array] is not empty, filePath is changed only if extension is in fromExtensions
*/
var changeExtension = function(filePath, toExtension, fromExtensions) {
    var dir = path.dirname(filePath);
    var extension = path.extname(filePath);
    var filename = path.basename(filePath, extension);
    return fromExtensions && fromExtensions.length && fromExtensions.indexOf(extension.split(".")[1]) === -1 ?
        filePath : path.join(dir, `${filename}.${toExtension}`);
};

module.exports = {
    readFile: readFile,
    writeFile: generatorify(fs.writeFile),
    copyFile: generatorify(copyFile),
    mkdirp: generatorify(_mkdirp),
    copyRecursive: generatorify(wrench.copyDirRecursive),
    exists: exists,
    empty: empty,
    changeExtension: changeExtension,
    remove: generatorify(rimraf),
    readdir: generatorify(fs.readdir)
};
