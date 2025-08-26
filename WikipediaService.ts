import {Service} from "@token-ring/registry";
import {doFetchWithRetry} from "@token-ring/utility/doFetchWithRetry";

export type WikipediaConfig = {
  baseUrl?: string;
};

export type WikipediaSearchOptions = {
  limit?: number;
  namespace?: number;
  offset?: number;
};

export default class WikipediaService extends Service {
  name = "Wikipedia";
  description = "Service for searching Wikipedia articles";
  private baseUrl: string;

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

    const url = `${this.baseUrl}/w/api.php?${params}`;
    
    const res = await doFetchWithRetry(url, {
      method: "GET",
      headers: {
        "User-Agent": "TokenRing-Writer/1.0 (https://github.com/tokenring/writer)",
      },
    });

    return await this.parseJsonOrThrow(res, "Wikipedia search");
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
      headers: {
        "User-Agent": "TokenRing-Writer/1.0 (https://github.com/tokenring/writer)",
      },
    });

    if (!res.ok) {
      throw Object.assign(new Error(`Wikipedia page retrieval failed (${res.status})`), {
        status: res.status,
      });
    }

    return await res.text();
  }

  private async parseJsonOrThrow(res: Response, context: string): Promise<any> {
    const text = await res.text().catch(() => "");
    try {
      const json = text ? JSON.parse(text) : undefined;
      if (!res.ok) {
        throw Object.assign(new Error(`${context} failed (${res.status})`), {
          status: res.status,
          details: json ?? text?.slice(0, 500),
        });
      }
      return json;
    } catch (e: any) {
      if (res.ok) {
        return text;
      }
      if (!e.status) {
        throw Object.assign(new Error(`${context} failed (${res.status})`), {
          status: res.status,
          details: text?.slice(0, 500),
        });
      }
      throw e;
    }
  }
}