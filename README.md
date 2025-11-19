# Wikipedia Package Documentation

## Overview

The `@tokenring-ai/wikipedia` package provides seamless integration with the Wikipedia API for searching articles and
retrieving raw page content. It is designed specifically for use within the Token Ring AI agent framework, enabling
agents to query Wikipedia programmatically. The package includes a core `WikipediaService` class for direct API
interactions and two agent tools (`search` and `getPage`) for easy incorporation into AI workflows.

Key features:

- Search Wikipedia articles by query with options for limit, namespace, and offset.
- Fetch raw wiki markup content of a Wikipedia page by title.
- Built-in retry logic for API requests using `doFetchWithRetry`.
- Input validation using Zod schemas for tools.
- Configurable base URL (defaults to English Wikipedia).

This package acts as a service and tool provider in the larger Token Ring ecosystem, allowing AI agents to access
reliable, up-to-date Wikipedia data without direct HTTP handling.

## Installation/Setup

This package is intended as a dependency in a Token Ring AI project. Install it via npm:

```bash
npm install @tokenring-ai/wikipedia
```

### Dependencies

Ensure your project has the required peer dependencies:

- `@tokenring-ai/agent` (for service and tool integration)
- `@tokenring-ai/utility` (for `doFetchWithRetry`, if not bundled)

### Setup in Token Ring Agent

1. Import and instantiate `WikipediaService` in your agent configuration.
2. Register the service with your agent instance.
3. The tools (`wikipedia/search` and `wikipedia/getPage`) are automatically available via the package export.

Example agent setup (TypeScript):

```typescript
import { Agent } from '@tokenring-ai/agent';
import WikipediaService from '@tokenring-ai/wikipedia';

const agent = new Agent({
  services: [new WikipediaService({ baseUrl: 'https://en.wikipedia.org' })],
});
```

## Package Structure

The package follows a modular structure for easy integration:

- **`index.ts`**: Entry point. Exports the `packageInfo` object (conforming to `TokenRingPackage`) including tools, and
  the default `WikipediaService`.
- **`WikipediaService.ts`**: Core implementation of the Wikipedia API service, implementing `TokenRingService`.
- **`tools.ts`**: Re-exports the individual tools for easy import.
- **`tools/search.ts`**: Agent tool for searching Wikipedia articles.
- **`tools/getPage.ts`**: Agent tool for retrieving page content.
- **`package.json`**: Metadata, dependencies, and exports configuration.
- **`vitest.config.js`**: Vitest configuration for testing.
- **`test/`**: Integration tests (e.g., `WikipediaService.integration.test.js`).

Directories are auto-created as needed during builds.

## Core Components

### WikipediaService

The `WikipediaService` is the primary class for interacting with the Wikipedia API. It implements the `TokenRingService`
interface and handles HTTP requests with error handling and retries.

#### Constructor

```typescript
constructor(config: WikipediaConfig = {})
```

- **Parameters**:
 - `config`: Optional object with `baseUrl` (string, defaults to `'https://en.wikipedia.org'`).
- **Description**: Initializes the service with the Wikipedia base URL.

#### search(query: string, opts: WikipediaSearchOptions = {}): Promise<any>

- **Parameters**:
 - `query`: Required search term (string).
 - `opts`: Optional options including:
  - `limit`: Number of results (default: 10, max typically 500).
  - `namespace`: Search namespace (default: 0, main articles).
  - `offset`: Pagination offset (default: 0).
- **Returns**: Promise resolving to Wikipedia's JSON response (e.g., `{ query: { search: [...] } }`).
- **Description**: Performs a search query using the MediaWiki API (`action=query&list=search`). Throws an error if
  `query` is empty or on API failure.
- **Error Handling**: Uses `parseJsonOrThrow` for JSON parsing and status checks; includes retry via `doFetchWithRetry`.

#### getPage(title: string): Promise<string>

- **Parameters**:
 - `title`: Required page title (string).
- **Returns**: Promise resolving to the raw wiki markup text of the page.
- **Description**: Fetches the page content using `action=raw` endpoint. Throws an error if `title` is empty or on fetch
  failure (e.g., 404).
- **Error Handling**: Checks response status; throws with status code on non-OK responses.

#### Internal Methods

- `parseJsonOrThrow(res: Response, context: string)`: Private helper for parsing responses, handling JSON/text, and
  throwing enhanced errors.

### Tools

Tools are designed for use within Token Ring agents. They wrap service methods with agent context (e.g., logging via
`chat.infoLine`) and Zod-validated inputs.

#### search Tool (`wikipedia/search`)

- **Description**: Searches Wikipedia and returns structured results. Logs the search query.
- **Input Schema** (Zod):
  ```typescript
  z.object({
    query: z.string().min(1).describe("Search query"),
    limit: z.number().int().positive().max(500).optional().describe("Number of results (1-500, default: 10)"),
    offset: z.number().int().min(0).optional().describe("Offset for pagination (default: 0)"),
  })
  ```
- **Execute Function**:
  ```typescript
  async execute({ query, limit, offset }, agent: Agent): Promise<{ results?: any }>
  ```
 - Requires `Agent` and `WikipediaService` from the agent.
 - Calls `wikipedia.search` and returns `{ results }`.
- **Interactions**: Depends on `WikipediaService.search`; uses agent for logging.

#### getPage Tool (`wikipedia/getPage`)

- **Description**: Retrieves raw wiki markup for a page by title. Logs the title being fetched.
- **Input Schema** (Zod):
  ```typescript
  z.object({
    title: z.string().min(1).describe("Wikipedia page title"),
  })
  ```
- **Execute Function**:
  ```typescript
  async execute({ title }, agent: Agent): Promise<{ content?: string }>
  ```
 - Requires `Agent` and `WikipediaService` from the agent.
 - Calls `wikipedia.getPage` and returns `{ content }`; throws on errors.
- **Interactions**: Depends on `WikipediaService.getPage`; uses agent for logging.

## Usage Examples

### Direct Service Usage

```typescript
import WikipediaService from '@tokenring-ai/wikipedia';

const wiki = new WikipediaService();

async function example() {
  // Search for articles
  const searchResults = await wiki.search('Token Ring', { limit: 5 });
  console.log(searchResults.query.search); // Array of search hits

  // Get page content
  const pageContent = await wiki.getPage('Token Ring');
  console.log(pageContent); // Raw wiki text
}
```

### Agent Tool Usage

In a Token Ring agent workflow, invoke tools via the agent's tool-calling mechanism:

```typescript
// Assuming agent is configured with WikipediaService
const response = await agent.executeTool('wikipedia/search', {
  query: 'Artificial Intelligence',
  limit: 3,
});

// Or for getPage
const pageResponse = await agent.executeTool('wikipedia/getPage', {
  title: 'Token Ring (networking)',
});
console.log(pageResponse.content); // Raw content
```

### Integration in Agent Pipeline

Tools can be chained, e.g., search first, then getPage on a result:

```typescript
// Pseudo-agent logic
const searchRes = await agent.tools.wikipedia.search({ query: 'Python programming' });
const topTitle = searchRes.results.query.search[0].title;
const content = await agent.tools.wikipedia.getPage({ title: topTitle });
```

## Configuration Options

- **baseUrl** (string, optional): Custom Wikipedia API base (e.g., `'https://fr.wikipedia.org'` for French). Defaults to
  English Wikipedia.
- **Environment Variables**: None required; all config is passed via constructor.
- **Request Headers**: Fixed `User-Agent` for compliance:
  `"TokenRing-Writer/1.0 (https://github.com/tokenring/writer)"`.
- **Retry Logic**: Handled internally by `doFetchWithRetry` (from `@tokenring-ai/utility`); configurable via that
  utility if needed.

No additional configs for tools; they inherit from the service.

## API Reference

### Public APIs (WikipediaService)

- `constructor(config?: { baseUrl?: string })`
- `search(query: string, opts?: { limit?: number; namespace?: number; offset?: number }): Promise<any>`
- `getPage(title: string): Promise<string>`

### Tools

- `wikipedia/search`:
  `execute(inputs: { query: string; limit?: number; offset?: number }, agent: Agent): Promise<{ results: any }>`
- `wikipedia/getPage`: `execute(inputs: { title: string }, agent: Agent): Promise<{ content: string }>`

### Exports

- `packageInfo: TokenRingPackage` (includes tools: `{ search, getPage }`)
- `WikipediaService` (default export)

## Dependencies

- **Runtime**:
 - `@tokenring-ai/ai-client@0.1.0`
 - `@tokenring-ai/agent@0.1.0`
 - `zod@^4.0.17` (for schema validation)
- **Peer/Internal**:
 - `@tokenring-ai/utility` (for `doFetchWithRetry`)

- **Development**:
 - `vitest@^3.2.4`
 - `@vitest/coverage-v8@^3.2.4`

## Contributing/Notes

- **Testing**: Run tests with `npm test` (uses Vitest). Includes integration tests for service methods.
- **Building**: As an ESM module (`type: "module"`), compatible with modern bundlers. Exports point to `.ts` files for
  type support.
- **Limitations**:
 - Searches are limited to text files; binary/media not supported.
 - Rate limiting: Wikipedia API has query limits (e.g., 500 results max per call); respect robots.txt and usage
   policies.
 - No caching; repeated calls may hit rate limits.
 - English Wikipedia by default; adjust `baseUrl` for other languages.
- **License**: MIT.
- Contributions: Fork the repo, add features/tests, and submit PRs to `tokenring/writer`.

For more on Token Ring integration, see the framework docs.