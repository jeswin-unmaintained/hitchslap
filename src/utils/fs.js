var fs = require("fs");
var generatorify = require("nodefunc-generatorify");
var extfs = require('extfs');
var _mkdirp = require("mkdirp");
var wrench = require("wrench");

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

module.exports = {
    writeFile: generatorify(fs.writeFile),
    readFile: generatorify(fs.readFile),
    mkdirp: generatorify(_mkdirp),
    copyRecursive: generatorify(wrench.copyDirRecursive),
    exists: exists,
    empty: empty,
    remove: generatorify(extfs.remove),
    readdir: generatorify(fs.readdir)
};
