import TokenRingApp from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {TokenRingPlugin} from "@tokenring-ai/app";
import packageJSON from './package.json' with {type: 'json'};

import * as tools from "./tools.ts";
import WikipediaService, {WikipediaConfigSchema} from "./WikipediaService.ts";

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    app.waitForService(ChatService, chatService =>
      chatService.addTools(packageJSON.name, tools)
    );
    const config = app.getConfigSlice('wikipedia', WikipediaConfigSchema.optional());
    if (config) {
      app.addServices(new WikipediaService(config));
    }
  },
} as TokenRingPlugin;


export {default as WikipediaService} from "./WikipediaService.ts";