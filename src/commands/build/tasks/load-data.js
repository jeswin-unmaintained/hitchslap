import path from "path";
import frontMatter from "front-matter";
import yaml from "js-yaml";
import fsutils from "../../../utils/fs";
import readFileByFormat from "../../../utils/file-reader";

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

                var records;
                try {
                    records = yield* readFileByFormat(filePath);

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
                var extension = path.extname(filePath);

                try {
                    var record = yield* readFileByFormat(filePath, { markdown: siteConfig.markdown_ext });
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
        if (siteConfig.scavenge_collection) {
            GLOBAL.site.data[siteConfig.scavenge_collection] = [];

            var collectionsAndDataDirs = Object.keys(siteConfig.collections)
                .map(coll => siteConfig.collections[coll].dir)
                .concat(siteConfig.dir_data)
                .map(dir => `!${dir}/`);

            var exclusions = ["!node_modules/", "!config.json", "!config.yml", "!config.yaml"].concat(collectionsAndDataDirs);

            this.watch(
                exclusions.concat(siteConfig.markdown_ext.concat(["json"]).map(ext => `*.${ext}`)),
                addToCollection(siteConfig.scavenge_collection)
            );
        }
    };
}
