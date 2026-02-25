# webmunk-default-page

Webmunk module that sets the default page for new tabs and open windows.

## Overview

**webmunk-default-page** replaces the browser's default new tab page with a custom page. It:

- Overrides Chrome's new tab page behavior
- Shows a loading page initially while config loads
- Displays a custom default page once ready

## Configuration

This module reads from the `default_page` section of the backend config.

### Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enabled` | boolean | Yes | - | Enable/disable the custom new tab page |
| `default_page` | string | Yes | - | Path to the HTML file to show as new tab (relative to extension root) |
| `initial_page` | string | No | - | Path to loading page shown before config loads |

### Example

```json
{
  "default_page": {
    "enabled": true,
    "default_page": "pages/newtab.html",
    "initial_page": "pages/loading.html"
  }
}
```

## Installation

Add to your extension's `package.json` dependencies:

```json
{
  "dependencies": {
    "@bric/webmunk-default-page": "github:bric-digital/webmunk-default-page#main"
  }
}
```

Then run `npm install`.

## Module Context Exports

- `./extension` - Extension UI context
- `./browser` - Browser/content script context
- `./service-worker` - Service worker context

## License

Apache 2.0
