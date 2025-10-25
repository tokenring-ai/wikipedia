import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import packageJSON from './package.json' with {type: 'json'};

import * as tools from "./tools.ts";
import WikipediaService, {WikipediaConfigSchema} from "./WikipediaService.ts";

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    agentTeam.waitForService(AIService, aiService =>
      aiService.addTools(packageJSON.name, tools)
    );
    const config = agentTeam.getConfigSlice('wikipedia', WikipediaConfigSchema.optional());
    if (config) {
      agentTeam.addServices(new WikipediaService(config));
    }
  },
} as TokenRingPackage;


export {default as WikipediaService} from "./WikipediaService.ts";