import path from "path";
import frontMatter from "front-matter";
import yaml from "js-yaml";
import fsutils from "../../../utils/fs";
/*
    config.dir_data directory contains a set of yaml files.
    Yaml is loaded into site.data.filename. eg: site.data.songs
*/
export default function(siteConfig) {

    return function() {
        GLOBAL.site.data = {};

        this.watch(
            ["yaml", "yml", "json"]
                .map(ext => siteConfig.dir_data.map(dir => `${dir}/*.${ext}`))
                .reduce((a,b) => a.concat(b)),
            function*(filePath) {
                var extension = path.extname(filePath);
                var fileContents = yield* fsutils.readFile(filePath);

                var records;
                try {
                    if (["yaml", "yml"].map(ext => `.${ext}`).indexOf(extension) > -1) {
                        records = yaml.safeLoad(fileContents);
                    }

                    if ([".json"].indexOf(extension) > -1) {
                        records = JSON.parse(fileContents);
                    }

                    var filename = path.basename(filePath, extension);

                    if (records && records.length) {
                        GLOBAL.site.data[filename] = GLOBAL.site.data[filename] ? GLOBAL.site.data[filename].concat(records) : records  ;
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }
        );


        //Add a watch for each collection.
        var addToCollection = function(collection) {
            return function*(filePath) {
                var fileContents = yield* fsutils.readFile(filePath);
                var extension = path.extname(filePath);

                try {
                    var record;

                    if (siteConfig.markdown_ext.map(ext => `.${ext}`).indexOf(extension) > -1) {
                        record = frontMatter(fileContents);
                    }

                    if ([".json"].indexOf(extension) > -1) {
                        record = JSON.parse(fileContents);
                    }

                    record.__filename = path.basename(filePath);

                    if (record)
                        GLOBAL.site.data[collection].push(record);
                } catch (ex) {
                    console.log(ex);
                }
            };
        };

        for (let collection in siteConfig.collections) {
            GLOBAL.site.data[collection] = [];
            //Check the collection directories
            this.watch(
                siteConfig.markdown_ext.concat(["json"]).map(ext => `${siteConfig.collections[collection].dir}/*.${ext}`),
                addToCollection(collection)
            );
        }

        //If scavenging is on, we need to pick up md and json files outside
        //  collection and data_dir and push them into the scavenge collection.
        if (siteConfig.scavange_collection) {

        }
    };
}
