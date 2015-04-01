//This polyfill is needed on ES5
require("babel/polyfill");

import co from "co";
import optimist from "optimist";
import * as commands from "./commands";
import yaml from "js-yaml";
import path from "path";
import fsutils from "./utils/fs";
import { print } from "./utils/logging";
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
    valueSetter initializes config properties with
        a) command-line params, if specified
        b) default values, if property is currently empty
*/
var getValueSetter = (config) => {
    config.__defaultFields = [];

    return (fullyQualifiedProperty, defaultValue, options = {}) => {
        //props are like "a.b.c"; we need to find config.a.b.c
        //propParent will be config.a.b, in this case.
        var propArray = fullyQualifiedProperty.split(".");
        var prop = propArray.slice(propArray.length - 1)[0];
        var propParents = propArray.slice(0, propArray.length - 1);

        //Make sure a.b exists in config
        var currentProp = config;
        for (let parent of propParents) {
            if (typeof currentProp[parent] === "undefined" || currentProp[parent] === null) {
                currentProp[parent] = {};
            }
            currentProp = currentProp[parent];
        }

        var commandLineArg = argv[fullyQualifiedProperty];
        if (typeof commandLineArg !== "undefined" && commandLineArg !== null) {
            if (options.replace || !(currentProp[prop] instanceof Array)) {
                currentProp[prop] = commandLineArg;
            } else {
                if (currentProp[prop] instanceof Array) {
                    currentProp[prop] = currentProp[prop].concat(commandLineArg);
                }
            }
        } else if (typeof currentProp[prop] === "undefined" || currentProp[prop] === null) {
            currentProp[prop] = defaultValue;
            config.__defaultFields.push(fullyQualifiedProperty);
        } else if (config.__defaultFields.indexOf(fullyQualifiedProperty) !== -1) {
            if (options.replace) {
                currentProp[prop] = defaultValue;
            } else {
                if (currentProp[prop] instanceof Array) {
                    currentProp[prop] = currentProp[prop].concat(defaultValue);
                }
            }
        }
    };
};


/*
    example of obj:
    {
        prop1: false,
        prop2: "hello",
        prop3: { value: ["A"], options: { replace: true } }
        prop4: {
            propInner1: 100
        }
    }

    returns [
        ["prop1", false],
        ["prop2", "hello"],
        ["prop3", "A", { replace: true}],
        ["prop4.propInner", 1000]
    ]
}
*/
var getFullyQualifiedProperties = (obj, prefixes = [], acc = []) => {
    for (var key in obj) {
        let val = obj[key];
        var fullNameArray = prefixes.concat(key);
        if (!(val instanceof Array) && val !== null && typeof val === "object" && (typeof val.value === "undefined")) {
            acc.push([fullNameArray.join("."), {}]);
            getFullyQualifiedProperties(val, fullNameArray, acc);
        } else {
            if (val && typeof val.value !== "undefined") {
                acc.push([fullNameArray.join("."), val.value, val]);
            } else {
                acc.push([fullNameArray.join("."), val]);
            }
        }
    }
    return acc;
};


var getSiteConfig = function*() {
    var siteConfig = {};

    var source = argv.source || argv.s || "./";
    var destination = argv.destination || argv.d || "_site";

    var configFilePath = argv.config ? path.join(source, argv.config) :
        (yield* fsutils.exists(path.join(source, "config.json"))) ? path.join(source, "config.json") : path.join(source, "config.yml");

    siteConfig = yield* readFileByFormat(configFilePath);

    var setter = getValueSetter(siteConfig);

    var defaults = getFullyQualifiedProperties({
        mode: "default",

        source: source,
        destination: destination,

        dir_custom_tasks: "custom_tasks",
        dirs_client_vendor: ["vendor"],

        //Exclude these patterns
        dirs_exclude: [".git", "node_modules"],
        patterns_exclude: [
            { exclude: "file", regex: "\.gitignore" }
        ],

        //build
        dir_client_build: "js",
        client_js_suffix: "~client",

        build_dev: false,
        dir_dev_build: "dev_js",
        dev_js_suffix: "~dev",

        //collections
        collections: {},
        collections_root_dir: "",

        entry_point: "app.js",
        js_extensions: ["js", "jsx"],


        //Handling Reading
        watch: true,

        //Serving
        detach: false,
        port: 4000,
        host: "127.0.0.1",
        baseurl: "",
        serve_static: "true",
        dirs_static_files: ["js", "vendor", "css", "images", "fonts"],

        //Outputting
        beautify: true, //beautify html output?

        //Make too much noise while processing?
        quiet: false,

        enabled_tasks: ["transpile", "load_data", "less", "copy_static_files", "build_client", "write_config"],
        tasks: {
            transpile: {
                blacklist: ["regenerator"]
            },
            load_data: {
                dirs_data: ["data"]
            },
            less: {
                dirs: ["css"]
            },
            copy_static_files: {
                skip_extensions: ["less"]
            },
            build_client: {
                dev: false
            },
            write_config: {
                filename: "config.json"
            }
        }
    });


    var modeDefaults = (
            siteConfig.mode !== "default" &&
            modes[siteConfig.mode] &&
            modes[siteConfig.mode].loadDefaults
        ) ? modes[siteConfig.mode].loadDefaults() : [];
    for (let args of defaults.concat(getFullyQualifiedProperties(modeDefaults))) {
        setter.apply(null, args);
    }

    //Store absolute paths for source and destination
    siteConfig.source = path.resolve(siteConfig.source);
    siteConfig.destination = path.resolve(siteConfig.source, siteConfig.destination);

    //Give modes one chance to update the siteConfig
    if (siteConfig.mode !== "default" && modes[siteConfig.mode].updateSiteConfig) {
        defaults = defaults.concat(modes[siteConfig.mode].updateSiteConfig(siteConfig));
    }

    //We don't need this anymore.
    delete siteConfig.__defaultFields;

    return siteConfig;
};


co(function*() {
    try {
        var commandName = getCommand();
        if (commandName) {
            var command = commands[`_${commandName}`];
            if (["new", "help"].indexOf(commandName) !== -1) {
                yield* command();
            } else {
                var config = yield* getSiteConfig();
                yield* command(config);
            }
        } else {
            print("Invalid command. Use --help for more information.");
        }
    }
    catch(err) {
        print(err.stack);
    }
});
