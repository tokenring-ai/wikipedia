import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import WikipediaService from "../WikipediaService.ts";

export const name = "wikipedia/getPage";

export async function execute(
  {
    title,
  }: {
    title?: string;
  },
  registry: Registry,
): Promise<{ content?: string }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const wikipedia = registry.requireFirstServiceByType(WikipediaService);

  if (!title) {
    throw new Error(`[${name}] title is required`);
  }

  try {
    chat.infoLine(`[wikipediaGetPage] Retrieving: ${title}`);
    const content = await wikipedia.getPage(title);
    return {content};
  } catch (e: any) {
    const message = e?.message || String(e);
    throw new Error(`[${name}] ${message}`);
  }
}

export const description = "Retrieve a Wikipedia page's raw wiki markup content by title.";

export const inputSchema = z.object({
  title: z.string().min(1).describe("Wikipedia page title"),
});