//This polyfill is needed on ES5
require("6to5/polyfill");

import co from "co";
import optimist from "optimist";
import * as commands from "./commands";
import path from "path";
import yaml from "js-yaml";
import fs from "fs";

var argv = optimist.argv;


var getGlobalConfiguration = function() {
    var config = {};
    config.source = path.resolve(argv.source || argv.s || "./");
    config.destination = argv.destination || argv.d ? path.resolve(argv.destination || argv.d) :
        path.join(config.source, "_site");
    config.__libdir = __dirname;
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

    return commands[`_${command}`];
};


co(function*() {
    try {
        var command = getCommand();
        if (command) {
            var config = getGlobalConfiguration();
            yield* command(config);
        } else {
            console.log("Usage: hitchslap command [options]. Type hitchslap -h for help.");
        }
    }
    catch(err) {
        console.error(err.stack);
    }
});
