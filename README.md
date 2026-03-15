# @tokenring-ai/wikipedia

Wikipedia search and content retrieval integration for Token Ring AI agents. This package provides a service for interacting with the Wikipedia API and tools for AI agents to search articles and retrieve raw wiki markup content.

## Overview

The `@tokenring-ai/wikipedia` package enables seamless integration with the Wikipedia API for searching articles and retrieving raw content. It is designed specifically for use within the Token Ring AI agent framework, allowing agents to query Wikipedia programmatically.

### Key Features

- **WikipediaService**: Core service for direct API interactions with Wikipedia
- **Agent Tools**: Two pre-built tools for AI workflows:
  - `wikipedia_search`: Search Wikipedia articles with configurable options
  - `wikipedia_getPage`: Retrieve raw wiki markup content by page title
- **TypeScript Support**: Full TypeScript definitions and type safety
- **Input Validation**: Zod schemas for robust input validation
- **Error Handling**: Built-in error handling for invalid inputs and API failures
- **Configurable**: Support for different Wikipedia language editions
- **Plugin Architecture**: Integrates seamlessly with Token Ring app ecosystem

## Installation

```bash
bun install @tokenring-ai/wikipedia
```

## Features

- Search Wikipedia articles with configurable limit, namespace, and offset
- Retrieve raw wiki markup content by page title
- Support for multiple Wikipedia language editions (English, Spanish, French, etc.)
- Custom User-Agent header for API compliance
- Type-safe tool definitions with Zod validation
- Integration with Token Ring agent system
- Plugin-based installation and configuration

## Core Components/API

### WikipediaService

The core service class for Wikipedia API interactions. Extends `HttpService` and implements `TokenRingService` interface.

**Constructor:**

```typescript
constructor(options: ParsedWikipediaConfig)
```

**Parameters:**

- `options` (ParsedWikipediaConfig): Configuration options
  - `baseUrl` (string, optional): Base URL for Wikipedia API (defaults to "https://en.wikipedia.org")

**Properties:**

- `name` (string): Service name - "WikipediaService"
- `description` (string): Service description - "Service for searching Wikipedia articles"
- `options` (ParsedWikipediaConfig): Service configuration
- `baseUrl` (string): The configured Wikipedia base URL
- `defaultHeaders` (object): Default HTTP headers including User-Agent

**Methods:**

#### search(query: string, opts?: WikipediaSearchOptions): Promise<any>

Search Wikipedia articles and return structured results.

**Parameters:**

- `query` (string): Search term (required)
- `opts` (WikipediaSearchOptions, optional):
  - `limit` (number): Maximum number of results (default: 10)
  - `namespace` (number): Search namespace (default: 0)
  - `offset` (number): Pagination offset (default: 0)

**Returns:** Promise resolving to Wikipedia API search response with structure:
```typescript
{
  query: {
    search: Array<{
      title: string;
      snippet: string;
      // ... other search result properties
    }>
  }
}
```

**Throws:** Error if query is empty or API request fails

#### getPage(title: string): Promise<string>

Retrieve raw wiki markup content of a Wikipedia page.

**Parameters:**

- `title` (string): Wikipedia page title (required)

**Returns:** Promise resolving to raw wiki markup text

**Throws:** Error if title is empty or page retrieval fails

**Example usage:**

```typescript
import WikipediaService, { WikipediaConfigSchema } from "@tokenring-ai/wikipedia";

const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({
  baseUrl: "https://en.wikipedia.org"
}));

// Search for articles
const searchResults = await wikipedia.search("quantum computing", {
  limit: 3
});

// Get page content
const content = await wikipedia.getPage("Quantum computing");
console.log(content); // Raw wiki markup
```

### Tool Definitions

The package exports two tools via the `tools` module:

#### wikipedia_search

**Display Name:** Wikipedia/search

**Description:** Search Wikipedia articles. Returns structured JSON with search results.

**Input Schema:**
```typescript
z.object({
  query: z.string().min(1).describe("Search query"),
  limit: z.number().int().positive().max(500).optional().describe("Number of results (1-500, default: 10)"),
  offset: z.number().int().min(0).optional().describe("Offset for pagination (default: 0)"),
})
```

**Returns:** JSON result with search data

**Example:**
```typescript
const result = await agent.executeTool("wikipedia_search", {
  query: "artificial intelligence",
  limit: 5
});
```

#### wikipedia_getPage

**Display Name:** Wikipedia/getPage

**Description:** Retrieve a Wikipedia page's raw wiki markup content by title.

**Input Schema:**
```typescript
z.object({
  title: z.string().min(1).describe("Wikipedia page title"),
})
```

**Returns:** Text result with raw wiki markup content

**Example:**
```typescript
const content = await agent.executeTool("wikipedia_getPage", {
  title: "Machine learning"
});
```

## Usage Examples

### Basic Search and Retrieve

```typescript
import WikipediaService, { WikipediaConfigSchema } from "@tokenring-ai/wikipedia";

const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));

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
import WikipediaService from "@tokenring-ai/wikipedia";
import Agent from "@tokenring-ai/agent";

// In a Token Ring agent context
async function researchTopic(agent: Agent, query: string) {
  // Get the Wikipedia service
  const wikipedia = agent.requireServiceByType(WikipediaService);

  // Search for relevant articles
  const searchResults = await wikipedia.search(query, { limit: 5 });

  // Get content from the most relevant article
  if (searchResults.query.search.length > 0) {
    const topArticle = searchResults.query.search[0];
    const pageContent = await wikipedia.getPage(topArticle.title);

    return {
      title: topArticle.title,
      snippet: topArticle.snippet,
      content: pageContent
    };
  }

  throw new Error("No relevant articles found");
}
```

### Multi-language Wikipedia

```typescript
import WikipediaService from "@tokenring-ai/wikipedia";

// Search in multiple languages
const enWiki = new WikipediaService({ baseUrl: "https://en.wikipedia.org" });
const deWiki = new WikipediaService({ baseUrl: "https://de.wikipedia.org" });
const jaWiki = new WikipediaService({ baseUrl: "https://ja.wikipedia.org" });

// English search
const enResults = await enWiki.search("artificial intelligence", { limit: 5 });

// German search
const deResults = await deWiki.search("Kuenstliche Intelligenz", { limit: 5 });

// Japanese search
const jaResults = await jaWiki.search("人工知能", { limit: 5 });
```

### Using Tools Directly

```typescript
import tools from "@tokenring-ai/wikipedia/tools";
import WikipediaService from "@tokenring-ai/wikipedia";
import Agent from "@tokenring-ai/agent";

// Create service
const wikipedia = new WikipediaService({});

// Register tools with agent
const agent = new Agent();
agent.addServices(wikipedia);
agent.addTools(tools);

// Execute search tool
const searchResult = await agent.executeTool("wikipedia_search", {
  query: "machine learning",
  limit: 10
});

// Execute get page tool
const pageResult = await agent.executeTool("wikipedia_getPage", {
  title: "Machine learning"
});
```

## Configuration

### Base URL Configuration

You can configure the service to use different Wikipedia language editions:

```typescript
import WikipediaService, { WikipediaConfigSchema } from "@tokenring-ai/wikipedia";

// English Wikipedia (default)
const englishWiki = new WikipediaService(WikipediaConfigSchema.parse({}));

// Spanish Wikipedia
const spanishWiki = new WikipediaService({
  baseUrl: "https://es.wikipedia.org"
});

// French Wikipedia
const frenchWiki = new WikipediaService({
  baseUrl: "https://fr.wikipedia.org"
});
```

### Plugin Configuration

The plugin accepts a configuration object with optional Wikipedia settings:

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

**Configuration Schema:**

```typescript
WikipediaConfigSchema = z.object({
  baseUrl: z.string().default("https://en.wikipedia.org")
});
```

### User-Agent

The service uses a custom User-Agent header for API requests by default:

```
TokenRing-Writer/1.0 (https://github.com/tokenring/writer)
```

This is configured automatically in the `defaultHeaders` property and does not require manual configuration.

## Integration

### Plugin Installation

Install the plugin in your Token Ring application:

```typescript
import TokenRingApp from "@tokenring-ai/app";
import wikipediaPlugin from "@tokenring-ai/wikipedia";

const app = new TokenRingApp();

// Install with default configuration
app.install(wikipediaPlugin);

// Install with custom configuration
app.install(wikipediaPlugin, {
  wikipedia: {
    baseUrl: "https://en.wikipedia.org"
  }
});
```

The plugin automatically:
1. Registers the `WikipediaService` with the app
2. Adds the Wikipedia tools to the `ChatService`

### Service Registration

The plugin automatically registers the `WikipediaService` when installed. The service is available via the provider pattern:

```typescript
import WikipediaService from "@tokenring-ai/wikipedia";

// In an agent context
const wikipedia = agent.requireServiceByType(WikipediaService);
const results = await wikipedia.search("artificial intelligence");
```

### Tool Registration

The plugin automatically registers the Wikipedia tools with the ChatService:

```typescript
// Tools are automatically registered when plugin is installed
// Available tools:
// - wikipedia_search
// - wikipedia_getPage
```

### Manual Service Registration

You can also register the service manually without using the plugin:

```typescript
import TokenRingApp from "@tokenring-ai/app";
import WikipediaService from "@tokenring-ai/wikipedia";
import tools from "@tokenring-ai/wikipedia/tools";
import { ChatService } from "@tokenring-ai/chat";

const app = new TokenRingApp();

// Register service
app.addServices(new WikipediaService({}));

// Register tools
app.waitForService(ChatService, chatService =>
  chatService.addTools(tools)
);
```

## RPC Endpoints

This package does not define RPC endpoints.

## State Management

This package does not implement state persistence or restoration. The service is stateless and maintains no internal state between calls.

## Best Practices

### Error Handling

Always handle errors when calling Wikipedia API methods:

```typescript
try {
  const results = await wikipedia.search("query");
  // Process results
} catch (error) {
  console.error("Search failed:", error.message);
  // Handle error appropriately
}
```

### Pagination

For large result sets, use the `offset` parameter for pagination:

```typescript
// First page
const page1 = await wikipedia.search("science", { limit: 10, offset: 0 });

// Second page
const page2 = await wikipedia.search("science", { limit: 10, offset: 10 });
```

### Rate Limiting

Be mindful of API rate limits. You should:

- Limit the number of consecutive requests
- Use appropriate result limits (default: 10)
- Cache results when possible

### Language Selection

Choose the appropriate Wikipedia language edition for your use case:

```typescript
// For English content
const enWiki = new WikipediaService({ baseUrl: "https://en.wikipedia.org" });

// For localized content
const esWiki = new WikipediaService({ baseUrl: "https://es.wikipedia.org" });
```

## Testing

Run the test suite:

```bash
bun run test
```

**Test commands:**

- `bun run test` - Run all tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage report

### Test Examples

```typescript
import { describe, expect, it } from "vitest";
import WikipediaService, { WikipediaConfigSchema } from "@tokenring-ai/wikipedia";

describe("WikipediaService", () => {
  it("should search English Wikipedia successfully", async () => {
    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    const result = await wikipedia.search("artificial intelligence", { limit: 3 });

    expect(result).toBeDefined();
    expect(result.query).toBeDefined();
    expect(result.query.search).toBeInstanceOf(Array);
    expect(result.query.search.length).toBeGreaterThan(0);
  });

  it("should retrieve page content by title", async () => {
    const wikipedia = new WikipediaService(WikipediaConfigSchema.parse({}));
    const content = await wikipedia.getPage("Pet door");

    expect(content).toBeDefined();
    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(0);
  });
});
```

## Package Structure

```
pkg/wikipedia/
├── index.ts                    # Main entry point - exports WikipediaService
├── plugin.ts                   # Token Ring plugin integration
├── WikipediaService.ts         # Core Wikipedia API service and schema
├── tools.ts                    # Tool exports (search and getPage)
├── tools/
│   ├── search.ts               # Wikipedia search tool definition
│   └── getPage.ts              # Wikipedia page retrieval tool definition
├── package.json                # Package metadata and dependencies
├── vitest.config.ts            # Vitest configuration
├── test/
│   └── WikipediaService.integration.test.ts  # Integration tests
└── README.md                   # This documentation
```

## Dependencies

### Production Dependencies

- `@tokenring-ai/app` - Base application framework with service management
- `@tokenring-ai/chat` - Chat and tool integration
- `@tokenring-ai/agent` - Agent framework and execution
- `@tokenring-ai/utility` - Shared utilities including HTTP helpers (`doFetchWithRetry`)
- `zod` - Schema validation (^4.3.6)

### Development Dependencies

- `vitest` - Testing framework (^4.1.0)
- `@vitest/coverage-v8` - Code coverage (^4.1.0)
- `typescript` - TypeScript support (^5.9.3)

## Related Components

- `@tokenring-ai/research` - Research service that may integrate Wikipedia functionality
- `@tokenring-ai/websearch` - General web search integration
- `@tokenring-ai/browser` - Browser-based content retrieval

## Error Handling

The service includes comprehensive error handling:

- **Invalid inputs**: Throws descriptive errors for missing required parameters
- **API failures**: Handles HTTP errors and non-OK responses
- **Network issues**: Uses retry logic via `doFetchWithRetry` for page retrieval
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

## License

MIT License - see [LICENSE](./LICENSE) file for details.
