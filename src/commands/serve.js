import koa from "koa";
import koaStatic from "koa-static";

export default function*(config, siteConfig) {
    var koa = require('koa');
    var app = koa();
    app.use(koaStatic(config.destination));
    app.listen(siteConfig.port);

    console.log(`
            Configuration file: ${config.source}/_config.yml
                    Source: ${config.source}
               Destination: ${config.destination}
              Generating...
                            done.
         Auto-regeneration: enabled for '${config.source}'
        Configuration file: ${config.source}/_config.yml
            Server address: http://${siteConfig.host}:${siteConfig.port}/
          Server running... press ctrl-c to stop.
    `);
}
