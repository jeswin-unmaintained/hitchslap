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

module.exports = {
    writeFile: generatorify(fs.writeFile),
    readFile: readFile,
    mkdirp: generatorify(_mkdirp),
    copyRecursive: generatorify(wrench.copyDirRecursive),
    exists: exists,
    empty: empty,
    remove: generatorify(rimraf),
    readdir: generatorify(fs.readdir)
};
