//This polyfill is needed on ES5
require("babel/polyfill");

import co from "co";
import optimist from "optimist";
import * as commands from "./commands";
import yaml from "js-yaml";
import path from "path";
import fsutils from "./utils/fs";
import readFileByFormat from "./utils/file_reader";

//modes
import jekyllMode from "./jekyll_mode";
var modes = {
    "jekyll": jekyllMode
};


var argv = optimist.argv;

//debug mode?
if (argv.debug) {
    GLOBAL.CO_PARALLEL_TOOLS_DEBUG = true;
}

//Commands might need the templates directory. Easier from root.
GLOBAL.__libdir = __dirname;

var getCommand = function() {
    return (
        (argv.help || argv.h) ? "help" :
        (argv.version || argv.v) ? "version" :
        process.argv[2]
    );
};

/*
    getValueSetter() returns a valueSetter function.
    valueSetter initializes config properties with command-line params and default values.
*/
var getValueSetter = (config) => {
    return (fullyQualifiedProperty, defaultValue, options = {}) => {
        //props are like "a.b.c"; we need to find config.a.b.c
        //propParent will be config.a.b, in this case.
        var propArray = fullyQualifiedProperty.split(".");
        var prop = propArray.slice(propArray.length - 1)[0];
        var propParents = propArray.slice(0, propArray.length - 1);

        //Make sure a.b exists in config
        var currentProp = config;
        for (let parent of propParents) {
            if (typeof currentProp[parent] === "undefined" || currentProp[parent] === null)
                currentProp[parent] = {};
            currentProp = currentProp[parent];
        }

        var commandLineArg = argv[fullyQualifiedProperty];
        if (typeof commandLineArg !== "undefined" && commandLineArg !== null) {
            if (options.replace || !(currentProp[prop] instanceof Array))
                currentProp[prop] = commandLineArg;
            else
                currentProp[prop].push(commandLineArg);
        } else if (typeof currentProp[prop] === "undefined" || currentProp[prop] === null) {
            currentProp[prop] = defaultValue;
        }
    };
};

var getSiteConfig = function*(siteExists) {
    var siteConfig = {};

    if (siteExists) {
        var source = argv.source || argv.s || "./";
        var destination = argv.destination || argv.d || "_site";

        var configFilePath = argv.config ? path.join(source, argv.config) :
            (yield* fsutils.exists(path.join(source, "config.json"))) ? path.join(source, "config.json") : path.join(source, "config.yml");

        siteConfig = yield* readFileByFormat(configFilePath);
        siteConfig.mode = siteConfig.mode || "jekyll";

        var setter = getValueSetter(siteConfig);

        var defaults = [
            ['source', source],
            ['destination', destination],

            ["dir_custom_tasks", "custom_tasks"],

            ["collections", {}],

            //Handling Reading
            ["watch", true],

            //Serving
            ["detach", false],
            ["port", 4000],
            ["host", "127.0.0.1"],
            ["baseurl", ""],

            //Outputting
            ["beautify", true], //beautify html output?

            //Make too much noise while processing?
            ["quiet", false],

            ["disabled_tasks", []],

            ["tasks.webpack.exclude_dirs", ["custom_tasks"]],
        ];

        var modeDefaults = (siteConfig.mode !== "default" && modes[siteConfig.mode].loadDefaults) ? modes[siteConfig.mode].loadDefaults() : [];
        for (let args of defaults.concat(modeDefaults)) {
            setter.apply(null, args);
        }

        //Store absolute paths for source and destination
        siteConfig.source = path.resolve(siteConfig.source);
        siteConfig.destination = path.resolve(siteConfig.source, siteConfig.destination);

        //Give modes one chance to update the siteConfig
        if (siteConfig.mode !== "default" && modes[siteConfig.mode].updateSiteConfig) {
            defaults = defaults.concat(modes[siteConfig.mode].updateSiteConfig(siteConfig));
        }
    } else {
        siteConfig.mode = "jekyll";
    }

    siteConfig.node_modules = siteConfig.node_modules || ["react"];

    return siteConfig;
};


co(function*() {
    try {
        var commandName = getCommand();
        if (commandName) {
            var command = commands[`_${commandName}`];
            var config = yield* getSiteConfig(["new", "help"].indexOf(commandName) === -1);
            yield* command(config);
        } else {
            console.log("Invalid command. Use --help for more information.");
        }
    }
    catch(err) {
        console.error(err.stack);
    }
});
