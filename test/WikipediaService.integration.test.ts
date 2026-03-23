import {describe, expect, it, vi, beforeEach, afterEach} from "vitest";
import WikipediaService, {WikipediaConfigSchema} from "../WikipediaService.ts";

// Mock the doFetchWithRetry function
vi.mock("@tokenring-ai/utility/http/doFetchWithRetry", () => ({
  doFetchWithRetry: vi.fn(),
}));

import {doFetchWithRetry} from "@tokenring-ai/utility/http/doFetchWithRetry";

describe("WikipediaService Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should search English Wikipedia successfully", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        query: {
          search: [
            {title: "Artificial intelligence", snippet: "Test snippet"},
            {title: "Machine learning", snippet: "Test snippet 2"},
            {title: "Deep learning", snippet: "Test snippet 3"},
          ],
        },
      })),
    } as Response;

    vi.mocked(doFetchWithRetry).mockResolvedValue(mockResponse);

    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    const result = await wikipedia.search("artificial intelligence", {
      limit: 3,
    });

    expect(result).toBeDefined();
    expect(result.query).toBeDefined();
    expect(result.query.search).toBeInstanceOf(Array);
    expect(result.query.search.length).toBeGreaterThan(0);
    expect(result.query.search[0]).toHaveProperty("title");
  });

  it("should search Spanish Wikipedia with custom base URL", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        query: {
          search: [
            {title: "Inteligencia artificial", snippet: "Test snippet"},
            {title: "Aprendizaje automático", snippet: "Test snippet 2"},
          ],
        },
      })),
    } as Response;

    vi.mocked(doFetchWithRetry).mockResolvedValue(mockResponse);

    const wikipedia = new WikipediaService({
      baseUrl: "https://es.wikipedia.org",
    });
    const result = await wikipedia.search("inteligencia artificial", {
      limit: 2,
    });

    expect(result).toBeDefined();
    expect(result.query.search).toBeInstanceOf(Array);
    expect(result.query.search.length).toBeGreaterThan(0);
  });

  it("should handle pagination with offset", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        query: {
          search: [
            {title: "Science", snippet: "Test snippet"},
            {title: "Scientific method", snippet: "Test snippet 2"},
          ],
        },
      })),
    } as Response;

    vi.mocked(doFetchWithRetry).mockResolvedValue(mockResponse);

    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    const result = await wikipedia.search("science", {limit: 2, offset: 5});

    expect(result.query.search).toBeInstanceOf(Array);
    expect(result.query.search.length).toBeLessThanOrEqual(2);
  });

  it("should throw error for empty query", async () => {
    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    await expect(wikipedia.search("")).rejects.toThrow("query is required");
  });

  it("should retrieve page content by title", async () => {
    const mockPageContent = `{{Infobox}}
Pet door
A pet door is a small door...
{{References}}`;

    const mockResponse = {
      ok: true,
      status: 200,
      text: () => Promise.resolve(mockPageContent),
    } as Response;

    vi.mocked(doFetchWithRetry).mockResolvedValue(mockResponse);

    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    const content = await wikipedia.getPage("Pet door");

    expect(content).toBeDefined();
    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain("{{");
  });

  it("should throw error for empty title", async () => {
    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    await expect(wikipedia.getPage("")).rejects.toThrow("title is required");
  });

  it("should handle network errors gracefully", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    } as Response;

    vi.mocked(doFetchWithRetry).mockResolvedValue(mockResponse);

    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    await expect(wikipedia.search("test")).rejects.toThrow("Wikipedia search failed (500)");
  });

  it("should handle JSON parse errors", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      text: () => Promise.resolve("invalid json"),
    } as Response;

    vi.mocked(doFetchWithRetry).mockResolvedValue(mockResponse);

    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    const result = await wikipedia.search("test");
    
    // Should return empty object when JSON parsing fails
    expect(result).toBeDefined();
  });
});
