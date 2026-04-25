# Playwright MCP Setup

This project can benefit from a browser-inspection MCP when iterating on PDF preview pages and report UI. The recommended setup is the official Microsoft Playwright MCP server.

Recommended server:

- GitHub: `microsoft/playwright-mcp`
- npm package: `@playwright/mcp`

References:

- https://github.com/microsoft/playwright-mcp
- https://www.npmjs.com/package/@playwright/mcp

## Why Use It Here

Useful for this repo when:

- opening `/pdf-preview`
- inspecting page layout changes visually
- checking whether report-viewer pages are rendering correctly
- taking screenshots during UI iteration
- navigating and validating live local pages without relying only on source inspection

## Recommended Config

Add this MCP server to your client config:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

## Optional Variants

### Isolated Mode

Use isolated sessions if you want a clean browser state for each run:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--isolated"
      ]
    }
  }
}
```

### Allow Local Development Hosts

If host restrictions become an issue while inspecting local pages, configure allowed hosts explicitly.

Example:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--allowed-hosts",
        "localhost,127.0.0.1"
      ]
    }
  }
}
```

If needed, consult the upstream README for the current supported flags:

- https://github.com/microsoft/playwright-mcp

## Local Workflow For This Repo

Typical usage for report work:

1. Start the app locally:

```bash
npm run dev
```

2. Open the preview page:

```text
http://localhost:3000/pdf-preview
```

3. Use Playwright MCP to:

- navigate to the page
- inspect layout and DOM/accessibility structure
- take screenshots
- verify spacing, centering, colors, and copy changes

## Scope Guidance For Future Agents

Use Playwright MCP when:

- source inspection is not enough
- visual verification matters
- a layout bug is easier to confirm in-browser than in code

Do not assume visual correctness from code alone when working on:

- page 1 cover layout
- legend centering
- footer traffic light sizing
- report viewer rendering

## Related Local Files

- [PDF-REPORT-AGENT-NOTES.md](/Users/nelsoncosta/dev/LandlordAuditReport/PDF-REPORT-AGENT-NOTES.md)
- [app/pdf-preview/page.tsx](/Users/nelsoncosta/dev/LandlordAuditReport/app/pdf-preview/page.tsx)
- [app/api/pdf-preview/route.ts](/Users/nelsoncosta/dev/LandlordAuditReport/app/api/pdf-preview/route.ts)

## Current Status

At the time this document was added:

- the repo does not include Playwright MCP as a built-in configured tool
- this document exists to make future setup straightforward
- the preferred choice is the official Microsoft implementation, not an unofficial fork
