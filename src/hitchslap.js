//This polyfill is needed on ES5
require("babel/polyfill");

import co from "co";
import optimist from "optimist";
import * as commands from "./commands";
import yaml from "js-yaml";
import path from "path";
import fsutils from "./utils/fs";

var argv = optimist.argv;

//debug mode?
if (argv.debug){ GLOBAL.CRANKSHAFT_DEBUG_MODE = true;}

//Commands might need the templates directory. Easier from root.
GLOBAL.__libdir = __dirname;

var getCommand = function() {
    return (
        (argv.help || argv.h) ? "help" :
        (argv.version || argv.v) ? "version" :
        process.argv[2]
    );
};


var getSiteConfig = function*() {

    var source = argv.source || argv.s || "./";
    var destination = argv.destination || argv.d || "_site";

    var getValueSetter = (config) => (prop, defaultValue) => {
        if (typeof argv[prop] !== "undefined" && argv[prop] !== null) {
            config[prop] = argv[prop];
        } else if (typeof config[prop] === "undefined" || config[prop] === null) {
            config[prop] = defaultValue;
        }
    };

    var configFilePath = argv.config ? path.join(source, argv.config) :
        (yield* fsutils.exists(path.join(source, "config.json"))) ? path.join(source, "config.json") : path.join(source, "_config.yml");

    var siteConfig;

    //If we are using _config.yml, assume we are using jekyll compat mode
    if (/_config\.yml$/.test(configFilePath)) {
        siteConfig = yaml.safeLoad(yield* fsutils.readFile(configFilePath));
        siteConfig.mode = siteConfig.mode || "jekyll";

    } else {
        siteConfig = require(configFilePath);
        siteConfig.mode = siteConfig.mode || "default";
    }

    var defaults = [
        ['source', source],
        ['destination', destination],

        ["dir_data", "_data"],
        ["dir_hitchslap", "_hitchslap"],
        ["dir_includes", "_includes"],
        ["dir_layouts", "_layouts"],
        ["dir_build_plugins", "_plugins"],
        ["dir_css", "css"],
        ["dir_client_js", "vendor"],

        ["collections", []],

        //Handling Reading
        ["keep_files", [".git", ".svn"]],
        ["encoding", "utf-8"],
        ["markdown_ext", ["markdown","mkdown","mkdn","mkd","md"]],
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

        //do not copy these extensions as static files. They aren't.
        ["skip_copying_extensions", ["markdown","mkdown","mkdn","mkd","md", "yml", "yaml", "jsx", "less", "json"]],

        ["disabled_plugins", []]
    ];

    if (siteConfig.mode === "jekyll") {
        defaults = defaults.concat([
            ["dir_posts", "_posts"],

            //Conversion
            ["markdown", "markdown"],
            ["highlighter", "highlight.js"],
            ["excerpt_separator", "\n\n"],

            //Filtering Content
            ["show_drafts", false],
            ["limit_posts", 0],
            ["future", false],
            ["unpublished", false],

            //Outputting
            ["permalink", "date"],
            ["paginate_path", "/page:num"],
            ["timezone", null],

        ]);
    }


    var setter = getValueSetter(siteConfig);
    defaults.forEach(args => { var [prop, val] = args; setter(prop, val); }); //until jshint gets param destructuring

    siteConfig.source = path.resolve(siteConfig.source);
    siteConfig.destination = path.resolve(siteConfig.source, siteConfig.destination);

    //Convert dir_xxx property values to [value] if value isn't an array.
    //We do this because dir_xxx properties allow multiple entries.
    for (var key in siteConfig) {
        if (/^dir_/.test(key)) {
            var val = siteConfig[key];
            if (!(val instanceof Array))
                siteConfig[key] = [val];
        }
    }

    return siteConfig;
};


co(function*() {
    try {
        var commandName = getCommand();
        if (commandName) {
            var command = commands[`_${commandName}`];
            var config = ["new", "help"].indexOf(commandName) === -1 ? yield* getSiteConfig() : null;
            yield* command(config);
        } else {
            console.log("Invalid command. Use --help for more information.");
        }
    }
    catch(err) {
        console.error(err.stack);
    }
});
