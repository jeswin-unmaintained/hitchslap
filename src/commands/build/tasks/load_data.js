import path from "path";
import frontMatter from "front-matter";
import yaml from "js-yaml";
import fsutils from "../../../utils/fs";
import readFileByFormat from "../../../utils/file_reader";
import { print, getLogger } from "../../../utils/logging";

/*
    config.dirs_data directory contains a set of yaml files.
    Yaml is loaded into site.data.filename. eg: site.data.songs
*/
export default function(siteConfig) {
    var logger = getLogger(siteConfig.quiet, "load_data");

    var taskConfig = siteConfig.tasks.load_data;

    var fn = function() {
        GLOBAL.site.data = {};

        this.watch(
            ["yaml", "yml", "json"]
                .map(ext => taskConfig.dirs_data.map(dir => `${dir}/*.${ext}`))
                .reduce((a,b) => a.concat(b)),
            function*(filePath) {
                var extension = path.extname(filePath);

                var records;
                try {
                    records = yield* readFileByFormat(filePath);

                    var filename = path.basename(filePath, extension);
                    if (records && records.length) {
                        GLOBAL.site.data[filename] = GLOBAL.site.data[filename] ? GLOBAL.site.data[filename].concat(records) : records  ;
                    }

                    logger(`loaded ${filePath} into ${filename}`);

                } catch (ex) {
                    logger(ex);
                }
            }
        );


        //Add a watch for each collection.
        var addToCollection = function(collection) {
            return function*(filePath) {
                var extension = path.extname(filePath);

                try {
                    var record = yield* readFileByFormat(filePath, { markdown: taskConfig.markdown_ext });
                    record.__filePath = filePath;

                    if (record)
                        GLOBAL.site.data[collection].push(record);
                        logger(`loaded ${filePath} into ${collection}`);
                } catch (ex) {
                    logger(ex);
                }
            };
        };

        //Check the collection directories
        for (let collectionName in siteConfig.collections) {
            GLOBAL.site.data[collectionName] = [];
            var collection = siteConfig.collections[collectionName];
            if (collection.dir) {
                var collectionDir = taskConfig.collections_root_dir ? path.combine(taskConfig.collections_root_dir, collection.dir) : collection.dir;
                this.watch(
                    taskConfig.markdown_ext.concat(["json"]).map(ext => `${collectionDir}/*.${ext}`),
                    addToCollection(collectionName)
                );
            }
        }

        //If scavenging is on, we need to pick up md and json files outside
        //  collection and data_dir and push them into the scavenge collection.
        if (siteConfig.scavenge_collection) {
            GLOBAL.site.data[siteConfig.scavenge_collection] = [];

            var collectionsAndDataDirs = Object.keys(siteConfig.collections)
                .map(coll => siteConfig.collections[coll].dir)
                .filter(item => item)
                .concat(taskConfig.dirs_data)
                .map(dir => `!${dir}/`);

            var exclusions = ["!node_modules/", "!config.json", "!config.yml", "!config.yaml"].concat(collectionsAndDataDirs);

            this.watch(
                exclusions.concat(taskConfig.markdown_ext.concat(["json"]).map(ext => `*.${ext}`)),
                addToCollection(siteConfig.scavenge_collection)
            );
        }
    };

    return { build: true, fn: fn };
}
