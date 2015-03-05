import koa from "koa";
import koaStatic from "koa-static";
import { print, getLogger } from "../utils/logging";

export default function*(siteConfig) {
    var koa = require('koa');
    var app = koa();
    app.use(koaStatic(siteConfig.destination));
    app.listen(siteConfig.port);

    print(`
            Configuration file: ${siteConfig.source}/_config.yml
                    Source: ${siteConfig.source}
               Destination: ${siteConfig.destination}
              Generating...
                            done.
         Auto-regeneration: enabled for '${siteConfig.source}'
        Configuration file: ${siteConfig.source}/_config.yml
            Server address: http://${siteConfig.host}:${siteConfig.port}/
          Server running... press ctrl-c to stop.
    `);
}
