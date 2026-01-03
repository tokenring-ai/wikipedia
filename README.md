# @tokenring-ai/wikipedia

Wikipedia search and content retrieval integration for Token Ring AI agents. This package provides a service for interacting with the Wikipedia API and tools for AI agents to search articles and retrieve raw wiki markup content.

## Overview

The `@tokenring-ai/wikipedia` package enables seamless integration with the Wikipedia API for searching articles and retrieving raw content. It is designed specifically for use within the Token Ring AI agent framework, allowing agents to query Wikipedia programmatically.

### Key Features

- **Wikipedia Service**: Core service for direct API interactions with Wikipedia
- **Agent Tools**: Two pre-built tools for AI workflows:
  - `wikipedia_search`: Search Wikipedia articles with configurable options
  - `wikipedia_getPage`: Retrieve raw wiki markup content by page title
- **TypeScript Support**: Full TypeScript definitions and type safety
- **Input Validation**: Zod schemas for robust input validation
- **Error Handling**: Built-in error handling and retry logic
- **Configurable**: Support for different Wikipedia language editions
- **Plugin Architecture**: Integrates seamlessly with Token Ring app ecosystem

## Installation

```bash
bun install @tokenring-ai/wikipedia
```

## Chat Commands

This package does not define chat commands. The functionality is exposed through agent tools instead.

## Plugin Configuration

The plugin accepts a configuration object with optional Wikipedia settings:

```typescript
interface WikipediaPluginConfig {
  wikipedia?: {
    baseUrl?: string;  // Wikipedia API base URL (default: https://en.wikipedia.org)
  }
}
```

**Example configuration:**

```typescript
import TokenRingApp from "@tokenring-ai/app";
import wikipediaPlugin from "@tokenring-ai/wikipedia";

const app = new TokenRingApp();
app.install(wikipediaPlugin, {
  wikipedia: {
    baseUrl: "https://en.wikipedia.org"  // Optional, defaults to English Wikipedia
  }
});
```

## Tools

The package provides the following tools that can be used by Token Ring agents:

### wikipedia_search

Search Wikipedia articles and return structured results.

**Tool Input Schema:**
```typescript
z.object({
  query: z.string().min(1).describe("Search query"),
  limit: z.number().int().positive().max(500).optional().describe("Number of results (1-500, default: 10)"),
  offset: z.number().int().min(0).optional().describe("Offset for pagination (default: 0)"),
})
```

**Example usage:**
```typescript
const result = await agent.executeTool("wikipedia_search", {
  query: "artificial intelligence",
  limit: 5
});
// Returns: { results: { query: { search: [...] } } }
```

### wikipedia_getPage

Retrieve the raw wiki markup content of a Wikipedia page by title.

**Tool Input Schema:**
```typescript
z.object({
  title: z.string().min(1).describe("Wikipedia page title"),
})
```

**Example usage:**
```typescript
const result = await agent.executeTool("wikipedia_getPage", {
  title: "Machine learning"
});
// Returns: { content: "{{Wiki markup content...}}" }
```

## Services

### WikipediaService

The core service class for Wikipedia API interactions.

**Constructor:**
```typescript
constructor(config?: WikipediaConfig)
```

**Parameters:**
- `config.baseUrl` (string, optional): Base URL for Wikipedia API (defaults to "https://en.wikipedia.org")

**Methods:**

#### search(query: string, options?: WikipediaSearchOptions): Promise<any>

Search Wikipedia articles.

**Parameters:**
- `query` (string): Search term (required)
- `options` (WikipediaSearchOptions, optional):
  - `limit` (number): Maximum number of results (default: 10)
  - `namespace` (number): Search namespace (default: 0)
  - `offset` (number): Pagination offset (default: 0)

**Returns:** Promise resolving to Wikipedia API search response

#### getPage(title: string): Promise<string>

Retrieve raw wiki markup content.

**Parameters:**
- `title` (string): Wikipedia page title (required)

**Returns:** Promise resolving to raw wiki markup text

**Example usage:**
```typescript
import WikipediaService from "@tokenring-ai/wikipedia";

const wikipedia = new WikipediaService({
  baseUrl: "https://en.wikipedia.org"
});

// Search for articles
const searchResults = await wikipedia.search("quantum computing", {
  limit: 3
});

// Get page content
const content = await wikipedia.getPage("Quantum computing");
```

## Providers

### WikipediaService Provider

The `WikipediaService` is a TokenRingService that can be required by agents using the `requireServiceByType` method.

**Provider Type:**
```typescript
import WikipediaService from "@tokenring-ai/wikipedia";

// In an agent context
const wikipedia = agent.requireServiceByType(WikipediaService);
```

**Usage in tools:**
```typescript
import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import WikipediaService from "../WikipediaService.ts";

async function execute({query}: z.infer<typeof inputSchema>, agent: Agent): Promise<any> {
  const wikipedia = agent.requireServiceByType(WikipediaService);
  const results = await wikipedia.search(query, {limit: 10});
  return {results};
}
```

## RPC Endpoints

This package does not define RPC endpoints.

## State Management

This package does not implement state persistence or restoration.

## Package Structure

```
pkg/wikipedia/
├── index.ts                 # Main entry point and plugin export
├── WikipediaService.ts      # Core Wikipedia API service
├── plugin.ts                # Token Ring plugin integration
├── tools.ts                 # Tool exports
├── tools/
│   ├── search.ts            # Wikipedia search tool
│   └── getPage.ts           # Wikipedia page retrieval tool
├── package.json             # Package metadata and dependencies
├── vitest.config.ts         # Vitest configuration
└── README.md                # This documentation
```

## Testing

Run the test suite:

```bash
bun run test
```

The package includes integration tests that verify:
- Wikipedia search functionality
- Page content retrieval
- Error handling for invalid inputs
- Support for different language editions

**Test commands:**
- `bun run test` - Run all tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage report

## Configuration

### Base URL Configuration

You can configure the service to use different Wikipedia language editions:

```typescript
import WikipediaService from "@tokenring-ai/wikipedia";

// English Wikipedia (default)
const englishWiki = new WikipediaService();

// Spanish Wikipedia
const spanishWiki = new WikipediaService({
  baseUrl: "https://es.wikipedia.org"
});

// French Wikipedia
const frenchWiki = new WikipediaService({
  baseUrl: "https://fr.wikipedia.org"
});
```

### User-Agent

The service uses a custom User-Agent header for API requests:
```
TokenRing-Writer/1.0 (https://github.com/tokenring/writer)
```

## Error Handling

The service includes comprehensive error handling:

- **Invalid inputs**: Throws descriptive errors for missing required parameters
- **API failures**: Handles HTTP errors and non-OK responses
- **Network issues**: Uses retry logic for transient failures
- **JSON parsing**: Validates and sanitizes API responses

**Error examples:**
```typescript
// Empty query throws error
await wikipedia.search("");  // Error: "query is required"

// Empty title throws error
await wikipedia.getPage("");  // Error: "title is required"

// Failed page retrieval
await wikipedia.getPage("NonExistentPage");  // Error with status code
```

## Examples

### Basic Search and Retrieve

```typescript
import WikipediaService from "@tokenring-ai/wikipedia";

const wikipedia = new WikipediaService();

// Search for articles
const searchResults = await wikipedia.search("quantum computing", {
  limit: 3
});

console.log("Search results:", searchResults.query.search);

// Get content from the first result
if (searchResults.query.search.length > 0) {
  const firstResult = searchResults.query.search[0];
  const content = await wikipedia.getPage(firstResult.title);
  console.log("Page content length:", content.length);
}
```

### Agent Workflow Example

```typescript
// In a Token Ring agent
async function researchTopic(query: string) {
  // Search for relevant articles
  const searchResult = await agent.executeTool("wikipedia_search", {
    query,
    limit: 5
  });

  // Get content from the most relevant article
  if (searchResult.results?.query?.search?.length > 0) {
    const topArticle = searchResult.results.query.search[0];
    const pageContent = await agent.executeTool("wikipedia_getPage", {
      title: topArticle.title
    });

    return {
      title: topArticle.title,
      snippet: topArticle.snippet,
      content: pageContent.content
    };
  }

  throw new Error("No relevant articles found");
}
```

### Multi-language Wikipedia

```typescript
import WikipediaService from "@tokenring-ai/wikipedia";

// Search in multiple languages
const enWiki = new WikipediaService({baseUrl: "https://en.wikipedia.org"});
const deWiki = new WikipediaService({baseUrl: "https://de.wikipedia.org"});
const jaWiki = new WikipediaService({baseUrl: "https://ja.wikipedia.org"});

// English search
const enResults = await enWiki.search("artificial intelligence", {limit: 5});

// German search
const deResults = await deWiki.search("Kuenstliche Intelligenz", {limit: 5});

// Japanese search
const jaResults = await jaWiki.search("人工知能", {limit: 5});
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.
