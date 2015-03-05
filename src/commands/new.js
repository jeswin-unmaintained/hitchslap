import tools from "crankshaft-tools";
import optimist from "optimist";
import path from "path";
import fsutils from "../utils/fs";
import { print, getLogger } from "../utils/logging";

var argv = optimist.argv;

export default function*(siteConfig) {
    var logger = getLogger(siteConfig);

    var dest = argv.source || argv.s || process.argv[3];
    if (!dest) {
        print("Error:  You must specify a path.");
        return;
    }

    if (!argv.force && !argv.recreate && !(yield* fsutils.empty(dest))) {
        print(`Conflict: ${path.resolve(dest)} is not empty.`);
    } else {
        if (argv.recreate) {
            if (yield* fsutils.exists(dest))
                yield* fsutils.remove(dest);
        }

        //Copy site_template
        yield* fsutils.copyRecursive(path.join(GLOBAL.__libdir, "site_template"), dest, { forceDelete: true });

        //Create node_modules
        var node_modules_path = path.resolve(GLOBAL.__libdir, "../node_modules");
        var dest_node_modules_path = path.resolve(dest, "node_modules");
        yield* fsutils.mkdirp(dest_node_modules_path);

        //Copy react
        for (let node_module of siteConfig.node_modules) {
            yield* fsutils.copyRecursive(path.join(node_modules_path, node_module), path.join(dest_node_modules_path, node_module), { forceDelete: true });
        }

        print(`New hitchslap site installed in ${path.resolve(dest)}.`);
    }

}
