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

    //Templates don't have to import react.
    //More importantly, we don't have to stash node_modules in every website.
    GLOBAL.React = React;

    /*
        _data directory contains a set of yaml files.
        Available as site.data.filename. eg: site.data.songs
    */
    var loadData = function*() {
        GLOBAL.site.data = {};

        var fullPath = path.resolve(siteConfig.source, siteConfig.dir_data);
        if (yield* fsutils.exists(fullPath)) {
            var dirEntries = yield* fsutils.readdir(fullPath);
            var files = dirEntries.map(file => path.join(fullPath, file));
            for(let file of files) {
                //We support only yaml and json now
                if ([".yaml", ".yml"].indexOf(path.extname(file).toLowerCase()) >= 0)
                    GLOBAL.site.data[path.basename(file).split(".")[0]] = yaml.safeLoad(yield* fsutils.readFile(file));

                if ([".json"].indexOf(path.extname(file).toLowerCase()) >= 0)
                    GLOBAL.site.data[path.basename(file).split(".")[0]] = JSON.parse(yield* fsutils.readFile(file));
            }
        }
    };


    var getPlugins = function*() {
        var fullPath = path.resolve(siteConfig.destination, siteConfig.dir_plugins);
        if (yield* fsutils.exists(fullPath)) {
            var dirEntries = yield* fsutils.readdir(fullPath);
            var files = dirEntries
                .map(file => path.join(fullPath, file))
                .filter(file => siteConfig.disabled_plugins.indexOf(path.basename(file, path.extname(file))) === -1);
            return files.map(f => require(f));
        } else {
            return [];
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


    /* Start */
    var startTime = Date.now();

    GLOBAL.site = {};
    yield* loadData();

    //Transpile everything first.
    var transpiler = crankshaft.create();
    transpiler.configure(transpile(siteConfig), siteConfig.source);
    yield* transpiler.start(false);

    //Create a crankshaft build
    var build = crankshaft.create();
    var codegens = [generatePages, generatePosts, generateCollections,
            generateTemplates, webpack, less, copyStaticFiles];
    var plugins = yield* getPlugins();

    for (var fn of codegens.concat(plugins)) {
        build.configure(fn(siteConfig), siteConfig.source);
    }

    build.onComplete(function*() {
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
