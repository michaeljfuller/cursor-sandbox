# MCP Comparison

A comparison document of the tested MCP servers: what they do well, limitations, and recommended use cases. Include example interactions from your testing.  
  
The [michaeljfuller/bmad-todo-app](https://github.com/michaeljfuller/bmad-todo-app) app used two MCP services; Chrome DevTools and Postman.  

## Chrome DevTools MCP
https://developer.chrome.com/blog/chrome-devtools-mcp

### What it does
Provides agents with access to the devtools in an instance of Chrome.

### Limitations
Not intended for E2E testing interactions.

### Recommended cases
Debugging and running tests, such as performance and lighthouse testing.

### Example interactions
> /bmad-agent-dev Please run lighthouse tests using devtools mcp

> /bmad-agent-qa Please use the chrome devtools mcp to do performance tests and document the results

> /bmad-agent-qa  use the chrome DevTools MCP to check for performance issues and document them


## Postman MCP
https://learning.postman.com/v11/docs/developer/postman-api/postman-mcp-server/overview

### What it does
Provides an interface to Postman, similar to that of a user.

### Limitations
Cannot be used for arbitrary requests. Everything needs to be part of a collection.

### Recommended cases
- Testing works in progress.
- Regression testing.
- Import collections into Postman.

### Example interactions
> Can you show me if you can connect to my local postman mcp?

> /bmad-agent-qa Can you use postman mcp to test the new endpoints?

> /bmad-agent-dev Please use the postman mcp for validation tests, using the existing Postman collection.

> /bmad-agent-qa Please use postman mcp to validate api contracts
