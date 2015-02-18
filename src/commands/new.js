import tools from "crankshaft-tools";
import optimist from "optimist";
import path from "path";
import fsutils from "../utils/fs";

var argv = optimist.argv;

export default function*(siteConfig) {

    var dest = argv.source || argv.s || process.argv[3];
    if (!dest) {
        console.error("Error:  You must specify a path.");
        return;
    }

    if (!argv.force && !argv.recreate && !(yield* fsutils.empty(dest))) {
        console.error(`Conflict: ${path.resolve(dest)} is not empty.`);
    } else {
        if (argv.recreate) {
            if (yield* fsutils.exists(dest))
                yield* fsutils.remove(dest);
        }
        yield* fsutils.copyRecursive(path.join(GLOBAL.__libdir, "site_template"), dest, { forceDelete: true });
        console.log(`New hitchslap site installed in ${path.resolve(dest)}.`);
    }

}