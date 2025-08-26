import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import WikipediaService from "../WikipediaService.ts";

export const name = "wikipedia/search";

export async function execute(
  {
    query,
    limit,
    offset,
  }: {
    query?: string;
    limit?: number;
    offset?: number;
  },
  registry: Registry,
): Promise<{ results?: any }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const wikipedia = registry.requireFirstServiceByType(WikipediaService);

  if (!query) {
    throw new Error(`[${name}] query is required`);
  }

  chat.infoLine(`[wikipediaSearch] Searching: ${query}`);
  const results = await wikipedia.search(query, {
    limit,
    offset,
  });
  return {results};
}

export const description = "Search Wikipedia articles. Returns structured JSON with search results.";

export const inputSchema = z.object({
  query: z.string().min(1).describe("Search query"),
  limit: z.number().int().positive().max(500).optional().describe("Number of results (1-500, default: 10)"),
  offset: z.number().int().min(0).optional().describe("Offset for pagination (default: 0)"),
});