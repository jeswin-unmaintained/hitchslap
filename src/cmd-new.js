import tools from "crankshaft-tools";
var exec = tools.process.exec({log: console.log});

var isEmpty = function*(dest) {
    var files = yield* exec(`ls -A ${dest}`);
    return files;
};

var createTemplate = function*(templateName, dest) {
    var files = yield* exec(`cp ${__dirname}/templates/${templateName} ${dest} -r`);
    return files;
};

export default function*() {
    var dest = process.argv[3];

    if (!dest) {
        console.error("Error:  You must specify a path.");
        return;
    }

    if (yield* isEmpty(dest)) {
        console.error(`Conflict: ${dest} is not empty.`);
        return;
    }

    yield* createTemplate("new", dest);
}
