import co from "co";
import optimist from "optimist";
import * as commands from "./commands";
import path from "path";
import yaml from "js-yaml";
import fs from "fs";

var argv = optimist.argv;


var loadOptions = function() {
    var options = {};
    options.source = path.resolve(argv.source || argv.s || "./");
    options.destination = argv.destination || argv.d ? path.resolve(argv.destination || argv.d) :
        path.join(options.source, "_site");
    return options;
};


var loadConfig = function(options) {
    var configFilePath = path.join(options.source, "_config.yml");
    var config = yaml.safeLoad(fs.readFileSync(configFilePath));
    config._libDir = __dirname;
    return config;
};


var getCommand = function() {
    var command;

    if (argv.help || argv.h) {
        command = "help";
    } else if (argv.version || argv.v) {
        command = "version";
    } else {
        command = process.argv[2];
    }

    return command;
};


co(function*() {
    try {
        var command = getCommand();
        var fnCmd = commands[`_${command}`];

        if (command === "version" || command === "help") {
            yield* fnCmd();
        } else if (fnCmd) {
            var options = loadOptions();
            var config = loadConfig(options);
            yield* fnCmd(config, options);
        } else {
            console.log("Usage: hitchslap command [options]. Type hitchslap -h for help.");
        }
    }
    catch(err) {
        console.error(err.stack);
    }
});
