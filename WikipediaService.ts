import {TokenRingService} from "@tokenring-ai/app/types";
import {doFetchWithRetry} from "@tokenring-ai/utility/http/doFetchWithRetry";
import {HttpService} from "@tokenring-ai/utility/http/HttpService";
import {z} from "zod";

export const WikipediaConfigSchema = z.object({
  baseUrl: z.string().optional(),
});

export type WikipediaConfig = z.infer<typeof WikipediaConfigSchema>;

export type WikipediaSearchOptions = {
  limit?: number;
  namespace?: number;
  offset?: number;
};

export default class WikipediaService extends HttpService implements TokenRingService {
  name = "WikipediaService";
  description = "Service for searching Wikipedia articles";

  protected baseUrl: string;
  protected defaultHeaders = {"User-Agent": "TokenRing-Writer/1.0 (https://github.com/tokenring/writer)"};

  constructor(config: WikipediaConfig = {}) {
    super();
    this.baseUrl = config.baseUrl || "https://en.wikipedia.org";
  }

  async search(query: string, opts: WikipediaSearchOptions = {}): Promise<any> {
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

    return this.fetchJson(`/w/api.php?${params}`, {method: "GET"}, "Wikipedia search");
  }

  async getPage(title: string): Promise<string> {
    if (!title) throw new Error("title is required");

    const params = new URLSearchParams({
      title,
      action: "raw",
    });


    const url = `${this.baseUrl}/w/index.php?${params}`;
    const res = await doFetchWithRetry(url, {
      method: "GET",
      headers: this.defaultHeaders,
    });

    if (!res.ok) {
      throw Object.assign(new Error(`Wikipedia page retrieval failed (${res.status})`), {
        status: res.status,
      });
    }

    return await res.text();
  }


}