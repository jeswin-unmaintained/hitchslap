var loadDefaults = function() {
    return [
        //Directories
        ["dir_includes", ["_includes"]],
        ["dir_layouts", ["_layouts"]],
        ["dir_client_js", ["_fora", "vendor"]],

        //Handling Reading
        ["markdown_ext", ["markdown","mkdown","mkdn","mkd","md"]],
        ["encoding", "utf-8"],

        //Conversion
        ["excerpt_separator", "\n\n"],

        //Filtering Content
        ["show_drafts", false],
        ["limit_posts", 0],
        ["future", false],
        ["unpublished", false],

        //Outputting
        ["permalink", "date"],
        ["paginate_path", "/page:num"],
        ["timezone", null],
    ]
    .map(values => [`jekyll.${values[0]}`, values[1]])
    .concat([
        ["tasks.transpile.exclude_dirs", ["vendor"]],
        ["tasks.load-data.dir_data", ["_data"]],
        ["tasks.load-data.markdown_ext", ["markdown","mkdown","mkdn","mkd","md"]],
        ["tasks.less.dirs", ["css"]],
        ["tasks.copy-static-files.skip_extensions", ["markdown","mkdown","mkdn","mkd","md", "yml", "yaml", "jsx", "less", "json"]],
        ["tasks.webpack.exclude_dirs", ["_data", "_includes", "_layouts", "_posts", "css", "vendor"]],
    ])
    .concat([
        ["collections.posts", { dir: "_posts", output: true }],
        ["collections.pages", { output: true }],
        ["scavenge_collection", "pages"]
    ]);
};

export default { loadDefaults };
