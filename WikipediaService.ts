import type { TokenRingService } from "@tokenring-ai/app/types";
import type { JSONValue } from "@tokenring-ai/utility/json/safeParse";
import { JSONValueSchema } from "@tokenring-ai/utility/json/schema";
import { doFetchWithRetry } from "@tokenring-ai/utility/http/doFetchWithRetry";
import { HTTPRetriever } from "@tokenring-ai/utility/http/HTTPRetriever";
import { z } from "zod";

export const WikipediaConfigSchema = z.object({
  baseUrl: z.string().default("https://en.wikipedia.org"),
});

export type ParsedWikipediaConfig = z.output<typeof WikipediaConfigSchema>;

export type WikipediaSearchOptions = {
  limit?: number | undefined;
  namespace?: number | undefined;
  offset?: number | undefined;
};

export default class WikipediaService implements TokenRingService {
  readonly name = "WikipediaService";
  description = "Service for searching Wikipedia articles";

  private readonly retriever: HTTPRetriever;

  constructor(readonly options: ParsedWikipediaConfig) {
    this.retriever = new HTTPRetriever({
      baseUrl: options.baseUrl,
      headers: { "User-Agent": "TokenRing-Writer/1.0 (https://github.com/tokenring/writer)" },
      timeout: 10_000,
    });
  }

  search(query: string, opts: WikipediaSearchOptions = {}): Promise<JSONValue> {
    if (!query) throw new Error("query is required");

    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
      srlimit: String(opts.limit || 10),
      srnamespace: String(opts.namespace || 0),
      sroffset: String(opts.offset || 0),
    });

    return this.retriever.fetchValidatedJson({
      url: `/w/api.php?${params}`,
      opts: { method: "GET" },
      schema: JSONValueSchema,
      context: "Wikipedia search",
    });
  }

  async getPage(title: string): Promise<string> {
    if (!title) throw new Error("title is required");

    const params = new URLSearchParams({
      title,
      action: "raw",
    });

    const url = `${this.options.baseUrl}/w/index.php?${params}`;
    const res = await doFetchWithRetry(url, {
      method: "GET",
      headers: { "User-Agent": "TokenRing-Writer/1.0 (https://github.com/tokenring/writer)" },
    });

    if (!res.ok) {
      throw Object.assign(new Error(`Wikipedia page retrieval failed (${res.status})`), {
        status: res.status,
      });
    }

    return await res.text();
  }
}
