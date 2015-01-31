import tools from "crankshaft-tools";
import fs from "fs";

var exec = tools.process.exec({log: console.log});

export default function*(config) {

    var isEmpty = function*(dest) {
        if (fs.existsSync(dest)) {
            var files = yield* exec(`ls -A ${dest}`);
            return files;
        }
    };

    var createTemplate = function*(templateName, dest) {
        yield* exec(`mkdir -p ${dest}`);
        var files = yield* exec(`cp ${config._libDir}/templates/${templateName}/* ${dest} -r`);
        return files;
    };

    var dest = process.argv[3];

    if (!dest) {
        console.error("Error:  You must specify a path.");
        return;
    }

    if (yield* isEmpty(dest)) {
        console.error(`Conflict: ${dest} is not empty.`);
        return;
    }

    yield* createTemplate("default", dest);
    console.log(`New hitchslap site installed in ${dest}.`);
}
