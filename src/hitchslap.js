import co from "co";
import optimist from "optimist";
import cmdBuild from "./cmd-build";
import cmdHelp from "./cmd-help";
import cmdNew from "./cmd-new";
import cmdServe from "./cmd-serve";
import cmdVersion from "./cmd-version";

optimist.alias('h', 'help');
var argv = optimist.argv;

var commands = {
    "build": cmdBuild,
    "help": cmdHelp,
    "new": cmdNew,
    "serve": cmdServe,
    "version": cmdVersion
};

var subCommand;
if (argv.help || argv.h) {
    subCommand = "help";
} else if (argv.version || argv.v) {
    subCommand = "version";
} else {
    subCommand = process.argv[2];
}

co(function*() {
    var cmd = commands[subCommand];
    if (!cmd) {
        console.log("Usage is hitchslap command [options]. You can type hitchslap -h for help.");
    } else {
        yield* cmd();
    }
});
