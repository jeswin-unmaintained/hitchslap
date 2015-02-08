import frontMatter from "front-matter";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import optimist from "optimist";
import crankshaft from "crankshaft";

import generatePages from "./generate-pages";
import generatePosts from "./generate-posts";
import generateCollections from "./generate-collections";
import copyStaticFiles from "./copy-static-files";

var argv = optimist.argv;

export default function*(config) {

    /*
        _data directory contains a set of yaml files.
        Available as site.data.filename. eg: site.data.songs
    */
    var loadData = function*(dir) {
        GLOBAL.site.data = {};

        var fullPath = path.join(config.source, `_${dir}`);
        if (fs.existsSync(fullPath)) {
            var files = fs.readdirSync(fullPath).map(file => path.join(fullPath, file));
            files.forEach(file => {
                //We support only yaml and json now
                if ([".yaml", ".yml"].indexOf(path.extname(file).toLowerCase()) >= 0)
                    GLOBAL.site[dir][path.basename(file).split(".")[0]] = yaml.safeLoad(fs.readFileSync(file));

                if ([".json"].indexOf(path.extname(file).toLowerCase()) >= 0)
                    GLOBAL.site[dir][path.basename(file).split(".")[0]] = JSON.parse(fs.readFileSync(file));
            });
        }
    };


    var getBuildOptions = function*() {
        var options = {};

        options.drafts = argv.drafts === true;
        options.future = argv.future === true;
        options.watch = argv.watch === true;
        return options;
    };


    var getSiteConfig = function*() {

        var getValueSetter = (config) => (prop, defaultValue) => {
            if (typeof argv[prop] !== "undefined" && argv[prop] !== null) {
                config[prop] = argv[prop];
            } else if (typeof config[prop] === "undefined" || config[prop] === null) {
                config[prop] = defaultValue;
            }
        };

        var configFilePath = path.join(config.source, (argv.config || "_config.yml"));
        var siteConfig = yaml.safeLoad(fs.readFileSync(configFilePath));

        var defaults = [
            ["destination", "./_site"],
            ["plugins", "./_plugins"],
            ["layouts", "./_layouts"],
            ["data_source", "./_data"],
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

            //Make too much noise while processing?
            ["quiet", false]
        ];
        var setter = getValueSetter(siteConfig);
        defaults.forEach(args => { var [prop, val] = args; setter(prop, val); }); //until jshint gets param destructuring

        return siteConfig;
    };

    console.log(`Source: ${config.source}`);
    console.log(`Destination: ${config.destination}`);

    var siteConfig = yield* getSiteConfig();

    //Create a crankshaft build
    var build = crankshaft.create({ threads: 1 });

    GLOBAL.site = {};
    yield* loadData("data");

    for (var fn of [generatePages, generatePosts]) {
        build.configure(yield* fn(config, siteConfig), config.source);
    }
    //build.configure(yield* generatePages(config, siteConfig), config.source);
    //build.configure(yield* generatePosts(config, siteConfig), config.source);
    //yield* generateCollections(config, siteConfig, build);
    //yield* copyStaticFiles(config, siteConfig, build);

    /* Start */
    build.start(siteConfig.watch);
}
