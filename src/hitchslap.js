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

    var configFilePath = path.join(source, (argv.config || "_config.yml"));
    var siteConfig = yaml.safeLoad(fsutils.readFile(configFilePath));

    var defaults = [
        ['source', source],
        ['destination', path.join(source, destination)],
        ["dir_data", "_data"],
        ["dir_hitchslap", "_hitchslap"],
        ["dir_includes", "_includes"],
        ["dir_layouts", "_layouts"],
        ["dir_plugins", "_plugins"],
        ["dir_posts", "_posts"],
        ["dir_css", "css"],
        ["dir_client_js", "vendor"],
        ["collections", []],

        //Handling Reading
        ["keep_files", [".git", ".svn"]],
        ["encoding", "utf-8"],
        ["markdown_ext", ["markdown","mkdown","mkdn","mkd","md"]],
        ["watch", true],

        //Filtering Content
        ["show_drafts", false],
        ["limit_posts", 0],
        ["future", false],
        ["unpublished", false],

        //Conversion
        ["markdown", "markdown"],
        ["highlighter", "highlight.js"],
        ["excerpt_separator", "\n\n"],

        //Serving
        ["detach", false],
        ["port", 4000],
        ["host", "127.0.0.1"],
        ["baseurl", ""],

        //Outputting
        ["permalink", "date"],
        ["paginate_path", "/page:num"],
        ["timezone", null],
        ["beautify", true], //beautify html output?

        //Make too much noise while processing?
        ["quiet", false],

        //do not copy these extensions as static files. They aren't.
        ["skip_copying_extensions", ["markdown","mkdown","mkdn","mkd","md", "yml", "yaml", "jsx", "less"]]
    ];
    var setter = getValueSetter(siteConfig);
    defaults.forEach(args => { var [prop, val] = args; setter(prop, val); }); //until jshint gets param destructuring

    return siteConfig;
};


co(function*() {
    try {
        var commandName = getCommand();
        if (commandName) {
            var command = commands[`_${commandName}`];
            yield* command(commandName !== "new" ? yield* getSiteConfig() : null);
        } else {
            console.log("Invalid command. Use --help for more information.");
        }
    }
    catch(err) {
        console.error(err.stack);
    }
});
