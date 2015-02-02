import frontMatter from "front-matter";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import optimist from "optimist";

import generatePages from "./generate-pages";
import generatePosts from "./generate-posts";
import generateCollections from "./generate-collections";
import copyStaticFiles from "./copy-static-files";

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
        var argv = optimist.argv;
        options.config = argv.config || "_config.yml";
        options.drafts = argv.drafts || false;
        options.future = argv.future || false;
        options.watch = argv.watch || false;
        return options;
    };


    var getSiteConfig = function*(src) {
        var configFilePath = path.join(config.source, src);
        return yaml.safeLoad(fs.readFileSync(configFilePath));
    };

    console.log(`Source: ${config.source}`);
    console.log(`Destination: ${config.destination}`);

    var buildOptions = yield* getBuildOptions();
    var siteConfig = yield* getSiteConfig(buildOptions.config);

    GLOBAL.site = {};
    yield* loadData("data");
    yield* generatePages(config, buildOptions, siteConfig);
    yield* generatePosts(config, buildOptions, siteConfig);
    yield* generateCollections(config, buildOptions, siteConfig);
    yield* copyStaticFiles(config, buildOptions, siteConfig);
}
