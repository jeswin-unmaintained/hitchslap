import frontMatter from "front-matter";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import fsutils from "../../utils/fs";
import optimist from "optimist";
import crankshaft from "crankshaft";

import generatePages from "./generate-pages";
import generatePosts from "./generate-posts";
import generateCollections from "./generate-collections";
import copyStaticFiles from "./copy-static-files";

var argv = optimist.argv;

export default function*(siteConfig) {

    /*
        _data directory contains a set of yaml files.
        Available as site.data.filename. eg: site.data.songs
    */
    var loadData = function*(dir) {
        GLOBAL.site.data = {};

        var fullPath = path.join(siteConfig.source, `_${dir}`);
        if (yield* fsutils.exists(fullPath)) {
            var dirEntries = yield* fsutils.readdir(fullPath);
            var files = dirEntries.map(file => path.join(fullPath, file));
            for(let file of files) {
                //We support only yaml and json now
                if ([".yaml", ".yml"].indexOf(path.extname(file).toLowerCase()) >= 0)
                    GLOBAL.site[dir][path.basename(file).split(".")[0]] = yaml.safeLoad(yield* fsutils.readFile(file));

                if ([".json"].indexOf(path.extname(file).toLowerCase()) >= 0)
                    GLOBAL.site[dir][path.basename(file).split(".")[0]] = JSON.parse(yield* fsutils.readFile(file));
            }
        }
    };


    var getBuildOptions = function*() {
        var options = {};

        options.drafts = argv.drafts === true;
        options.future = argv.future === true;
        options.watch = argv.watch === true;
        return options;
    };

    console.log(`Source: ${siteConfig.source}`);
    console.log(`Destination: ${siteConfig.destination}`);

    //Create a crankshaft build
    var build = crankshaft.create({ threads: 1 });

    GLOBAL.site = {};
    yield* loadData("data");

    for (var fn of [generatePages, generatePosts, generateCollections, copyStaticFiles]) {
        build.configure(yield* fn(siteConfig), siteConfig.source);
    }

    /* Start */
    build.start(siteConfig.watch).catch(err => {
        console.log(err);
        console.log(err.stack);
    });
}
