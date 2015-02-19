export default function(siteConfig) {
    /*
        This plugin prints the name of all files in the source directory.
        This plugin is disabled by default in _config.yml
    */
    return function() {
        this.watch("*.js", function*(filePath, ev, matches) {
            console.log(filePath);
        }, `print_all_js_files`);
    };
}
