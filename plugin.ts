import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {z} from "zod";
import packageJSON from './package.json' with {type: 'json'};

import tools from "./tools.ts";
import WikipediaService, {WikipediaConfigSchema} from "./WikipediaService.ts";

const packageConfigSchema = z.object({
  wikipedia: WikipediaConfigSchema.optional()
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    app.waitForService(ChatService, chatService =>
      chatService.addTools(packageJSON.name, tools)
    );
    if (config.wikipedia) {
      app.addServices(new WikipediaService(config.wikipedia));
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
