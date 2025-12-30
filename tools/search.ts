import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import WikipediaService from "../WikipediaService.ts";

const name = "wikipedia_search";

async function execute(
  {
    query,
    limit,
    offset,
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ results?: any }> {

  const wikipedia = agent.requireServiceByType(WikipediaService);

  if (!query) {
    throw new Error(`[${name}] query is required`);
  }

  agent.infoLine(`[wikipediaSearch] Searching: ${query}`);
  const results = await wikipedia.search(query, {
    limit,
    offset,
  });
  return {results};
}

const description = "Search Wikipedia articles. Returns structured JSON with search results.";

const inputSchema = z.object({
  query: z.string().min(1).describe("Search query"),
  limit: z.number().int().positive().max(500).optional().describe("Number of results (1-500, default: 10)"),
  offset: z.number().int().min(0).optional().describe("Offset for pagination (default: 0)"),
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;