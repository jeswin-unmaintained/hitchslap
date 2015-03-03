import path from "path";
import frontMatter from "front-matter";
import yaml from "js-yaml";
import fsutils from "../../../../utils/fs";
/*
    config.dir_data directory contains a set of yaml files.
    Yaml is loaded into site.data.filename. eg: site.data.songs
*/
export default function(siteConfig) {

    return function() {
        GLOBAL.site.data = {};

        for (let collection in siteConfig.collections) {
            GLOBAL.site.data[collection] = [];
        }

        this.watch(
            siteConfig.markdown_ext.concat(["json"])
                .map(ext => Object.keys(siteConfig.collections).map(dir => `${dir}/*.${ext}`))
                .reduce((a,b) => a.concat(b)),
            function*(filePath) {
                var collection = filePath.split("/")[0];
                var fileContents = yield* fsutils.readFile(filePath);
                var extension = path.extname(filePath);

                var record;
                try {
                    if (siteConfig.markdown_ext.map(ext => `.${ext}`).indexOf(extension) > -1) {
                        record = yaml.safeLoad(fileContents);
                    }

                    if ([".json"].indexOf(extension) > -1) {
                        record = JSON.parse(fileContents);
                    }
                } catch (ex) {
                    console.log(ex);
                }

                if (record)
                    GLOBAL.site.data[collection].push(record);
            }
        );

        this.watch(
            ["yaml", "yml", "json"]
                .map(ext => siteConfig.dir_data.map(dir => `${dir}/*.${ext}`))
                .reduce((a,b) => a.concat(b)),
            function*(filePath) {
                var extension = path.extname(filePath);
                var fileContents = yield* fsutils.readFile(filePath);

                var record;
                try {
                    if (["yaml", "yml"].map(ext => `.${ext}`).indexOf(extension) > -1) {
                        record = yaml.safeLoad(fileContents);
                    }

                    if ([".json"].indexOf(extension) > -1) {
                        record = JSON.parse(fileContents);
                    }
                } catch (ex) {
                    console.log(ex);
                }

                var filename = path.basename(filePath, extension);

                if (record)
                    GLOBAL.site.data[filename] = record;
            }
        );
    };
}
