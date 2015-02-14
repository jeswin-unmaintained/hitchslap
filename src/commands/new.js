import tools from "crankshaft-tools";
import fs from "fs";
import optimist from "optimist";
import path from "path";
import extfs from "extfs";
import generatorify from "nodefunc-generatorify";
var wrench = require("wrench");

var copyRecursive = generatorify(wrench.copyDirRecursive);

var empty = generatorify(function(path, cb) {
    extfs.isEmpty(path, function(result) {
        cb(null, result);
    });
});

var exists = generatorify(function(what, cb) {
    fs.exists(what, function(exists) {
        cb(null, exists);
    });
});

var argv = optimist.argv;

export default function*(siteConfig) {

    var dest = argv.source || argv.s || process.argv[3];
    if (!dest) {
        console.error("Error:  You must specify a path.");
        return;
    }

    var force = argv.force || false;
    if (!force && !(yield* empty(dest))) {
        console.error(`Conflict: ${path.resolve(dest)} is not empty.`);
    } else {
        yield* copyRecursive(path.join(GLOBAL.__libdir, "site_template"), dest, { forceDelete: true });
        console.log(`New hitchslap site installed in ${path.resolve(dest)}.`);
    }
}
