# Mini.ro Test Automation with Playwright and Express MCP Server

[![Full Test Suite](https://github.com/{owner}/{repo}/actions/workflows/test-suite.yml/badge.svg)](https://github.com/{owner}/{repo}/actions/workflows/test-suite.yml)

## Project Structure

```
.
├── tests/                    # Playwright E2E tests
│   └── bmw.spec.ts          # BMW website tests
├── mcp-server/              # Model Context Protocol server
│   ├── src/                 # Source code
│   │   ├── server.ts       # Main server file
│   │   ├── middleware/     # Middleware components
│   │   └── __tests__/     # Test files
│   └── package.json        # Server dependencies
├── playwright.config.ts     # Playwright configuration
└── package.json            # Main project dependencies
```

## Setup and Installation

1. Install dependencies:
```bash
npm install
cd mcp-server && npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the mcp-server directory
   - Update the values according to your environment

## Running Tests

### E2E Tests (Playwright)
```bash
npm run test              # Run all tests
npm run test:headed      # Run tests in headed mode
npm run test:ui         # Run tests with UI
```

### MCP Server Tests
```bash
cd mcp-server
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

## Continuous Integration

This project uses GitHub Actions for continuous integration:

- **E2E Tests**: Runs Playwright tests on every push and pull request
- **MCP Server Tests**: Tests the server with multiple Node.js versions
- **Combined Workflow**: Ensures all test suites pass before merging

### CI Features

- Parallel test execution
- Multiple Node.js versions testing
- Redis service container for cache testing
- Test coverage reporting
- Artifact upload for test reports
- Automatic browser installation
- Dependency caching

## Development Guidelines

1. Write tests for new features
2. Maintain test coverage above 80%
3. Run full test suite locally before pushing
4. Check CI results after pushing

## Security

- JWT authentication for API endpoints
- Rate limiting to prevent abuse
- Input validation for all requests
- Secure environment variable handling

## Monitoring

- Health check endpoints
- Performance metrics collection
- Error logging and tracking
- Redis cache monitoring

Replace `{owner}` and `{repo}` in the badge URLs with your actual GitHub repository information.
