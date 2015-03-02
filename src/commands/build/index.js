import frontMatter from "front-matter";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import fsutils from "../../utils/fs";
import optimist from "optimist";
import crankshaft from "crankshaft";
import React from "react";

import transpile from "./transpile";
import generatePages from "./generate-pages";
import generatePosts from "./generate-posts";
import generateCollections from "./generate-collections";
import generateTemplates from "./generate-templates";
import copyStaticFiles from "./copy-static-files";
import webpack from "./webpack";
import less from "./less";

var argv = optimist.argv;

export default function*(siteConfig) {

    /*
        Templates don't have to import react.
        Pre-load it into GLOBAL.
    */
    GLOBAL.React = React;


    /*
        config.dir_data directory contains a set of yaml files.
        Yaml is loaded into site.data.filename. eg: site.data.songs
    */
    var loadData = function*() {
        GLOBAL.site.data = {};

        for (let dataDir of siteConfig.dir_data) {
            var fullPath = path.resolve(siteConfig.source, dataDir);
            if (yield* fsutils.exists(fullPath)) {
                var dirEntries = yield* fsutils.readdir(fullPath);
                var files = dirEntries.map(file => path.join(fullPath, file));
                for (let file of files) {
                    //We support only yaml and json now
                    if ([".yaml", ".yml"].indexOf(path.extname(file).toLowerCase()) >= 0)
                        GLOBAL.site.data[path.basename(file).split(".")[0]] = yaml.safeLoad(yield* fsutils.readFile(file));

                    if ([".json"].indexOf(path.extname(file).toLowerCase()) >= 0)
                        GLOBAL.site.data[path.basename(file).split(".")[0]] = JSON.parse(yield* fsutils.readFile(file));
                }
            }
        }
    };


    /*
        Load plugins from the config.dir_build_plugins directory.
        Plugins are no different from the build plugins under src/commands/build
    */
    var getPlugins = function*() {
        var plugins = [];
        for (var pluginDir of siteConfig.dir_build_plugins) {
            var fullPath = path.resolve(siteConfig.destination, pluginDir);
            if (yield* fsutils.exists(fullPath)) {
                var dirEntries = yield* fsutils.readdir(fullPath);
                var files = dirEntries
                    .map(file => path.join(fullPath, file))
                    .filter(file => siteConfig.disabled_plugins.indexOf(path.basename(file, path.extname(file))) === -1);
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

    GLOBAL.site = {};
    yield* loadData();

    /*
        Transpile everything first.
        We need to do this separately because custom plugins need to be transpiled before they can be loaded.
        So create a build for it.
    */
    var transpiler = crankshaft.create();
    transpiler.configure(transpile(siteConfig), siteConfig.source);
    yield* transpiler.start(false);

    /*
        Add built-in codegens/plugins and custom plugins.
        Custom plugins will be loaded from {config.destination}/{config.dir_build_plugins} directory.
        This directory will be deleted once all plugins have been run.
    */
    var build = crankshaft.create();

    var codeGens = {
        "generate-pages": generatePages,
        "generate-posts": generatePosts,
        "generate-collections": generateCollections,
        "generate-templates": generateTemplates,
        "webpack": webpack,
        "less": less,
        "copy-static-files": copyStaticFiles
    };

    var codegens = Object.keys(codeGens)
        .filter(key => siteConfig.disabled_plugins.indexOf(key) === -1)
        .map(key => codeGens[key]);

    var plugins = yield* getPlugins();
    for (var fn of codegens.concat(plugins)) {
        build.configure(fn(siteConfig), siteConfig.source);
    }

    build.onComplete(function*() {
        //We can remove the custom plugins directory
        for (var pluginDir of siteConfig.dir_build_plugins) {
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
