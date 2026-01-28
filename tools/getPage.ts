import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition, type TokenRingToolTextResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import WikipediaService from "../WikipediaService.ts";

const name = "wikipedia_getPage";
const displayName = "Wikipedia/getPage";

async function execute(
  {
    title,
  }: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolTextResult> {

  const wikipedia = agent.requireServiceByType(WikipediaService);

  try {
    agent.infoMessage(`[wikipediaGetPage] Retrieving: ${title}`);
    return await wikipedia.getPage(title);
  } catch (e: any) {
    const message = e?.message || String(e);
    throw new Error(`[${name}] ${message}`);
  }
}

const description = "Retrieve a Wikipedia page's raw wiki markup content by title.";

const inputSchema = z.object({
  title: z.string().min(1).describe("Wikipedia page title"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;