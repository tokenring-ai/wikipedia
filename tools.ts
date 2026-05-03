import getPage from "./tools/getPage.ts";
import search from "./tools/search.ts";

// Array export for spreading into addTools()
export default [search, getPage];

// Named exports for individual tool access
export { search as wikipedia_search };
export { getPage as wikipedia_getPage };

// Object export for tools collection
export const tools = {
  search,
  getPage,
};
