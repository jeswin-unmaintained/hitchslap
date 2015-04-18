import path from "path";
import frontMatter from "front-matter";
import yaml from "js-yaml";
import fsutils from "../../../utils/fs";
import readFileByFormat from "../../../utils/file-reader";
import { print, getLogger } from "../../../utils/logging";

/*
    config.dirs_data directory contains a set of yaml files.
    Yaml is loaded into site.data.filename. eg: site.data.songs
*/
let loadStaticData = function(siteConfig, buildConfig, taskConfig) {
    let logger = getLogger(siteConfig.quiet, "load_data");

    let fn = function() {
        GLOBAL.site.data = {};

        this.watch(
            ["yaml", "yml", "json"]
                .map(ext => taskConfig.dirs_data.map(dir => `${dir}/*.${ext}`))
                .reduce((a,b) => a.concat(b)),
            function*(filePath) {
                let extension = path.extname(filePath);

                let records;
                try {
                    records = yield* readFileByFormat(filePath);

                    let filename = path.basename(filePath, extension);
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
        let addToCollection = function(collection) {
            return function*(filePath) {
                let extension = path.extname(filePath);

                try {
                    let record = yield* readFileByFormat(filePath, { markdown: taskConfig.markdown_ext });
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
            let collection = siteConfig.collections[collectionName];
            if (collection.dir) {
                let collectionDir = taskConfig.collections_root_dir ? path.combine(taskConfig.collections_root_dir, collection.dir) : collection.dir;
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

            let collectionsAndDataDirs = Object.keys(siteConfig.collections)
                .map(coll => siteConfig.collections[coll].dir)
                .filter(item => item)
                .concat(taskConfig.dirs_data)
                .map(dir => `!${dir}/`);

            let exclusions = ["!node_modules/", "!config.json", "!config.yml", "!config.yaml"].concat(collectionsAndDataDirs);

            this.watch(
                exclusions.concat(taskConfig.markdown_ext.concat(["json"]).map(ext => `*.${ext}`)),
                addToCollection(siteConfig.scavenge_collection)
            );
        }
    };

    return { build: true, fn: fn };
};

export default loadStaticData;
