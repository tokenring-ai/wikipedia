import { describe, it, expect } from "vitest";
import WikipediaService from "../WikipediaService.ts";

describe("WikipediaService Integration Tests", () => {
	it("should search English Wikipedia successfully", async () => {
		const wikipedia = new WikipediaService();
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
		const wikipedia = new WikipediaService();
		const result = await wikipedia.search("science", { limit: 2, offset: 5 });

		expect(result.query.search).toBeInstanceOf(Array);
		expect(result.query.search.length).toBeLessThanOrEqual(2);
	});

	it("should throw error for empty query", async () => {
		const wikipedia = new WikipediaService();
		await expect(wikipedia.search("")).rejects.toThrow("query is required");
	});

	it("should retrieve page content by title", async () => {
		const wikipedia = new WikipediaService();
		const content = await wikipedia.getPage("Pet door");

		expect(content).toBeDefined();
		expect(typeof content).toBe("string");
		expect(content.length).toBeGreaterThan(0);
		expect(content).toContain("{{");
	});

	it("should throw error for empty title", async () => {
		const wikipedia = new WikipediaService();
		await expect(wikipedia.getPage("")).rejects.toThrow("title is required");
	});
});
