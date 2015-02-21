export default function(siteConfig) {
    /*
        NOTE: This plugin is disabled in _config.yml
        It prints the name of all files in the source directory.
    */
    return function() {
        this.watch("*.js", function*(filePath, ev, matches) {
            console.log(filePath);
        }, `print_all_js_files`);
    };
}
