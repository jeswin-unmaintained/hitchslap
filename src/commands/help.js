export default function*(config, siteConfig) {
    console.log(`
        hitchslap 0.0.1 -- hitchslap is a blog-aware, static site generator in NodeJS

        Usage:

          hitchslap <subcommand> [options]

        Options:
                -s, --source [DIR]  Source directory (defaults to ./)
                -d, --destination [DIR]  Destination directory (defaults to ./_site)
                -h, --help         Show this message
                -v, --version      Print the name and version

        Subcommands:
          build, b              Build your site
          new                   Creates a new hitchslap site scaffold in PATH
          help                  Show the help message, optionally for a given subcommand.
          serve, s              Serve your site locally
    `);
}
