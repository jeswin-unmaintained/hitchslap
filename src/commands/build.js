import React from "react";
import frontMatter from "front-matter";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";

export default function*(config, options) {

    /*
        _data directory contains a set of yaml files.
        Available as site.data.filename. eg: site.data.songs
    */
    var loadData = function*(dir) {
        GLOBAL.site.data = {};

        var fullPath = path.join(options.source, `_${dir}`);
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


    /*
        Pages, Posts and Collections.
        Front matter formatted.
    */
    var loadDocs = function*(dir) {
        var fullPath = path.join(options.source, `_${dir}`);
        if (fs.existsSync(fullPath)) {
            var files = fs.readdirSync(fullPath).map(file => path.join(fullPath, file));
            GLOBAL.site[dir] = files
                .filter(file => [".md", ".markdown"].indexOf(path.extname(file).toLowerCase()) >= 0)
                .map(file => frontMatter(fs.readFileSync(file)));
        }
    };


    var renderPages = function*() {

    };


    var renderPosts = function*() {

    };


    var renderCollections = function*() {

    };

    /*
        Here is where actual rendering happ
    */
    var renderTemplates = function*() {
        var component = React.createFactory(reactClass)(props);
    };


    GLOBAL.site = {};
    yield* loadData("data");
    yield* loadDocs("posts");
    yield* loadDocs("pages");
    yield* loadDocs("collections");


}
