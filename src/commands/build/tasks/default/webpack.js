import webpack from "webpack";
import optimist from "optimist";
import path from "path";
import generatorify from "nodefunc-generatorify";
import { print, getLogger } from "../../../../utils/logging";

var argv = optimist.argv;

export default function(siteConfig) {
    /*
        Entry points are
            a) All standalone templates
            b) All templates in _layouts
    */
    var logger = getLogger(siteConfig, "webpack");

    var taskConfig = siteConfig.tasks.webpack;

    var fn = function() {
        var extensions = [`${path.resolve(siteConfig.destination)}/*.js`];

        //exclude these directories.
        //We exclude layouts because webpack needs only the entry point.
        var exclusions = ["node_modules"].concat(taskConfig.exclude_dirs).map(dir => `!${dir}/`);

        var files = [];
        this.watch(extensions.concat(exclusions), function*(filePath, ev, match) {
            files.push(filePath);
            this.queue("webpack_bundle");
        }, "webpack_queue");

        /*
            This will run whenever a js/react layout file changes.
        */
        this.job(function*() {
            var entries = files.concat(path.resolve(siteConfig.destination, "_fora/app.js"));
            var config = {
                entry: entries,
                output: {
                    filename: path.join(siteConfig.destination, "app.bundle.js")
                }
            };
            var compiler = webpack(config);
            var runner = generatorify(compiler.run.bind(compiler));
            var stats = yield* runner();
            logger(`packed ${entries.length} files into app.bundle.js`);
        }, "webpack_bundle");
    };

    return { build: true, fn: fn };
}
