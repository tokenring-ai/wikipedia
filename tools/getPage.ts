import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import WikipediaService from "../WikipediaService.ts";

const name = "wikipedia_getPage";

async function execute(
  {
    title,
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ content?: string }> {

  const wikipedia = agent.requireServiceByType(WikipediaService);

  if (!title) {
    throw new Error(`[${name}] title is required`);
  }

  try {
    agent.infoLine(`[wikipediaGetPage] Retrieving: ${title}`);
    const content = await wikipedia.getPage(title);
    return {content};
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
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;