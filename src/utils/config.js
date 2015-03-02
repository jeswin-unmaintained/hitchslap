export function getExcludedDirectories(config) {
    var props = ["dir_data", "dir_hitchslap", "dir_includes", "dir_layouts",
        "dir_build_plugins", "dir_posts",  "dir_css",  "dir_client_js"];
    return [].concat.apply([], props.map(k => config[k]));
}
