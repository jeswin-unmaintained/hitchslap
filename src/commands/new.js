import tools from "crankshaft-tools";
import optimist from "optimist";
import path from "path";
import fsutils from "../utils/fs";
import { print, getLogger } from "../utils/logging";

var argv = optimist.argv;

export default function*(siteConfig) {
    var logger = getLogger(siteConfig);

    var dest = argv.destination || argv.d || !(/^--/.test(process.argv[3])) ? process.argv[3] : "";
    if (!dest) {
        print("Error:  You must specify a path. eg: hitchslap new <dir> [options..].");
        return;
    }

    if (!argv.force && !argv.recreate && !(yield* fsutils.empty(dest))) {
        print(`Conflict: ${path.resolve(dest)} is not empty.`);
    } else {
        if (argv.recreate) {
            if (yield* fsutils.exists(dest))
                yield* fsutils.remove(dest);
        }

        //Copy site_templates
        yield* fsutils.copyRecursive(path.join(GLOBAL.__libdir, "site_templates", siteConfig.mode), dest, { forceDelete: true });

        //Install npm dependencies.
        var exec = tools.process.exec();
        var curdir = yield* exec(`pwd`);
        process.chdir(dest);
        console.log(yield* exec(`npm install`));
        process.chdir(curdir);

        print(`New ${siteConfig.mode} site installed in ${path.resolve(dest)}.`);
    }

}
