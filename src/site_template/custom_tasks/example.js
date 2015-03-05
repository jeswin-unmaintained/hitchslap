export default function(siteConfig) {
    /*
        NOTE: This plugin is disabled in _config.yml
        It prints the name of all files in the source directory.
    */
    var logger = getLogger(siteConfig);
    
    var fn = function() {
        this.watch("*.js", function*(filePath, ev, matches) {
            console.log(filePath);
        }, `print_all_js_files`);
    };

    return { build: true, fn: fn };
}
