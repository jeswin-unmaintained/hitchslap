import tools from "crankshaft-tools";
import fs from "fs";
import optimist from "optimist";
import path from "path";

var exec = tools.process.exec({log: console.log});
var argv = optimist.argv;

export default function*(config) {

    var isEmpty = function*(dest) {
        if (fs.existsSync(dest)) {
            var files = yield* exec(`ls -A ${dest}`);
            return files;
        }
    };

    var createTemplate = function*(dest) {
        yield* exec(`mkdir -p ${dest}`);
        var files = yield* exec(`cp ${config.__libdir}/site_template/* ${dest} -r`);
        yield* exec(`(cd ${dest} && npm install)`);
        return files;
    };

    var dest = process.argv[3];

    if (!dest) {
        console.error("Error:  You must specify a path.");
        return;
    }

    var force = argv.force || false;
    if (!force && yield* isEmpty(dest)) {
        console.error(`Conflict: ${path.resolve(dest)} is not empty.`);
        return;
    }

    yield* createTemplate(dest);
    console.log(`New hitchslap site installed in ${path.resolve(dest)}.`);
}
