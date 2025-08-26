# Wikipedia Package

Wikipedia search integration for TokenRing Writer.

## Features

- Search Wikipedia articles using the MediaWiki API
- Configurable base URL for different language versions
- Configurable result limits and pagination
- Namespace filtering support

## Usage

```typescript
import WikipediaService from "@token-ring/wikipedia/WikipediaService";

// Default English Wikipedia
const wikipedia = new WikipediaService();

// Spanish Wikipedia
const esWikipedia = new WikipediaService({
  baseUrl: "https://es.wikipedia.org"
});

const results = await wikipedia.search("artificial intelligence", {
  limit: 5,
  namespace: 0
});
```

## Configuration

In your `writer-config.js`:

```javascript
export default {
  wikipedia: {
    baseUrl: "https://fr.wikipedia.org"  // French Wikipedia
  }
};
```

## Tools

- `wikipedia/search` - Search Wikipedia articles with configurable options