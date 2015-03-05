import webpack from "webpack";
import optimist from "optimist";
import path from "path";
import generatorify from "nodefunc-generatorify";

var argv = optimist.argv;

export default function(siteConfig) {

    /*
        Entry points are
            a) All standalone templates
            b) All templates in _layouts
    */
    var fn = function() {
        var extensions = [`${path.resolve(siteConfig.destination)}/*.js`]
            //exclude these directories.
            //We exclude layouts because webpack needs only the entry point.
            .concat(
                ["dir_data", "dir_hitchslap", "dir_includes", "dir_layouts",
                        "dir_custom_tasks", "dir_posts",  "dir_css",  "dir_client_js"]
                    .map(k => siteConfig[k])
                    .concat("node_modules")
                    .map(dir => `!${dir}/`)
            );

        var files = [];
        this.watch(extensions, function*(filePath, ev, match) {
            files.push(filePath);
            this.queue("webpack_bundle");
        }, "webpack_queue");

        /*
            This will run whenever a js/react layout file changes.
        */
        this.job(function*() {
            var config = {
                entry: files.concat(path.resolve(siteConfig.destination, "_hitchslap/app.js")),
                output: {
                    filename: path.join(siteConfig.destination, "app.bundle.js")
                }
            };
            var compiler = webpack(config);
            var runner = generatorify(compiler.run.bind(compiler));
            var stats = yield* runner();
        }, "webpack_bundle");
    };

    return { build: true, fn: fn };
}
