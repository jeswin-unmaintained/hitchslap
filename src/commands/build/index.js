import frontMatter from "front-matter";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import fsutils from "../../utils/fs";
import optimist from "optimist";
import crankshaft from "crankshaft";
import React from "react";

import loadData from "./tasks/load-data";
import transpile from "./tasks/transpile";
import generatePages from "./tasks/generate-pages";
import generatePosts from "./tasks/generate-posts";
import generateCollections from "./tasks/generate-collections";
import generateTemplates from "./tasks/generate-templates";
import copyStaticFiles from "./tasks/copy-static-files";
import webpack from "./tasks/webpack";
import less from "./tasks/less";

var argv = optimist.argv;

export default function*(siteConfig) {

    GLOBAL.site = {};

    /*
        Load plugins from the config.dir_custom_tasks directory.
        Plugins are no different from the build plugins under src/commands/build
    */
    var getPlugins = function*() {
        var plugins = [];
        for (var pluginDir of siteConfig.dir_custom_tasks) {
            var fullPath = path.resolve(siteConfig.destination, pluginDir);
            if (yield* fsutils.exists(fullPath)) {
                var dirEntries = yield* fsutils.readdir(fullPath);
                var files = dirEntries
                    .map(file => path.join(fullPath, file))
                    .filter(file => siteConfig.disabled_tasks.indexOf(path.basename(file, path.extname(file))) === -1);
                plugins = plugins.concat(files.map(f => require(f)));
            }
        }
        return plugins;
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

    /* Start */
    var startTime = Date.now();

    /*
        Transpile everything first.
    */
    var transpiler = crankshaft.create();
    transpiler.configure(transpile(siteConfig), siteConfig.source);
    yield* transpiler.start(false);

    if (!siteConfig.db) {
        yield* loadData(siteConfig);
    }

    if (siteConfig.generateStaticPages) {
        //Create html files for all paths


    } else {
        //We need to write out the routing table since individual html files
        //dont exist.
        if (siteConfig.mode === "jekyll") {

        }
    }



    /*
        Add built-in codegens/plugins and custom plugins.
        Custom plugins will be loaded from {config.destination}/{config.dir_custom_tasks} directory.
        This directory will be deleted once all plugins have been run.
    */
    var build = crankshaft.create();

    var codeGens = siteConfig.mode === "jekyll" ?
        {
            "generate-pages": generatePages,
            "generate-posts": generatePosts,
            "generate-collections": generateCollections,
            "generate-templates": generateTemplates,
            "webpack": webpack,
            "less": less,
            "copy-static-files": copyStaticFiles
        } :
        {
            "generate-pages": generatePages,
            "generate-collections": generateCollections,
            "generate-templates": generateTemplates,
            "webpack": webpack,
            "less": less,
            "copy-static-files": copyStaticFiles
        };

    var codegens = Object.keys(codeGens)
        .filter(key => siteConfig.disabled_tasks.indexOf(key) === -1)
        .map(key => codeGens[key]);

    var plugins = yield* getPlugins();
    for (var fn of codegens.concat(plugins)) {
        build.configure(fn(siteConfig), siteConfig.source);
    }

    build.onComplete(function*() {
        //We can remove the custom plugins directory
        for (var pluginDir of siteConfig.dir_custom_tasks) {
            var pluginsPath = path.resolve(siteConfig.destination, pluginDir);
            if (yield* fsutils.exists(pluginsPath))
                yield* fsutils.remove(pluginsPath);
        }

        var endTime = Date.now();
        console.log(`Build took ${(endTime - startTime)/1000} seconds.`);
    });

    try {
        yield* build.start(siteConfig.watch);
    } catch(err) {
        console.log(err);
        console.log(err.stack);
    }
}
