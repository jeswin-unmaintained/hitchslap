var loadDefaults = function() {
    return [
        ["dir_posts", "_posts"],

        //Conversion
        ["markdown", "markdown"],
        ["highlighter", "highlight.js"],
        ["excerpt_separator", "\n\n"],

        //Filtering Content
        ["show_drafts", false],
        ["limit_posts", 0],
        ["future", false],
        ["unpublished", false],

        //Outputting
        ["permalink", "date"],
        ["paginate_path", "/page:num"],
        ["timezone", null]
    ];
};

var updateSiteConfig = function(siteConfig) {
    siteConfig.collections.posts = { dir: "_posts" };
};

export default { loadDefaults, updateSiteConfig };
