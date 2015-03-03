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
            GLOBAL.site.data[collection] = collection;
        }

        this.watch(
            ["yaml", "yml", "json"]
                .map(ext => Object.keys(siteConfig.collections).map(dir => `${dir}/*.${ext}`))
                .reduce((a,b) => a.concat(b)),
            function*(filePath) {
                var collection = filePath.split("/")[0];
                var extension = path.extname(filePath);

                var record;
                if ([".yaml", ".yml"].indexOf(extension) > -1)
                    record = yaml.safeLoad(yield* fsutils.readFile(filePath));

                if ([".json"].indexOf(extension) > -1)
                    record = JSON.parse(yield* fsutils.readFile(filePath));

                GLOBAL.site.data[collection].push(record);
            }
        );

        this.watch(
            ["yaml", "yml", "json"]
                .map(ext => siteConfig.dir_data.map(dir => `${dir}/*.${ext}`))
                .reduce((a,b) => a.concat(b)),
            function*(filePath) {
                var extension = path.extname(filePath);

                var record;
                if ([".yaml", ".yml"].indexOf(extension) > -1)
                    record = yaml.safeLoad(yield* fsutils.readFile(filePath));

                if ([".json"].indexOf(extension) > -1)
                    record = JSON.parse(yield* fsutils.readFile(filePath));

                var filename = path.basename(filePath, extension);
                GLOBAL.site.data[filename] = record;
            }
        );
    };
}
