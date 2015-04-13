import tools from "crankshaft-tools";
import optimist from "optimist";
import path from "path";
import fsutils from "../utils/fs";
import { print, getLogger } from "../utils/logging";

var argv = optimist.argv;

/*
    Search paths are:
        a) Current node_modules directory
        b) ~/.fora/templates/node_modules
*/
var resolveTemplatePath = function*(name) {
    var templateName = /^fora-template-/.test(name) ? name : `fora-template-${name}`;

    //Current node_modules_dir
    var templatePath = path.resolve(GLOBAL.__libdir, "../node_modules", templateName);
    if (yield* fsutils.exists(templatePath)) {
        return templatePath;
    } else {
        var HOME_DIR = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
        templatePath = path.resolve(`${HOME_DIR}/.fora/templates/node_modules`, templateName);
        if (yield* fsutils.exists(templatePath)) {
            return templatePath;
        }
    }
    throw new Error(`Template ${templateName} was not found.`);
};


export default function*() {
    var logger = getLogger(argv.quiet || false);

    var dest = argv.destination || argv.d || !(/^--/.test(process.argv[3])) ? process.argv[3] : "";
    if (!dest) {
        print("Error:  You must specify a path. eg: hitchslap new <dir> [options..].");
        return;
    }

    if (!argv.force && !argv.recreate && !(yield* fsutils.empty(dest))) {
        print(`Conflict: ${path.resolve(dest)} is not empty.`);
    } else {
        if (argv.recreate) {
            if (yield* fsutils.exists(dest)) {
                print(`Deleting ${dest}`);
                yield* fsutils.remove(dest);
            }
        }

        //Copy template
        var exec = tools.process.exec();
        var template = argv.template || argv.t || "blog";
        var templatePath = yield* resolveTemplatePath(template);
        logger(`Copying ${templatePath} -> ${dest}`);
        yield* fsutils.copyRecursive(templatePath, dest, { forceDelete: true });

        //Install npm dependencies.
        var curdir = yield* exec(`pwd`);
        process.chdir(dest);
        var npmMessages = yield* exec(`npm install`);
        print(npmMessages);
        process.chdir(curdir);

        print(`New ${template} site installed in ${path.resolve(dest)}.`);
    }
}
