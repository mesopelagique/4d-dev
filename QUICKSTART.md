# Quick Start Guide

## Project Structure

This project now serves **dual purposes**:
1. **MCP Server** - Works with AI assistants that support the Model Context Protocol
2. **VS Code Extension** - Provides commands directly in VS Code

```
mcp-4d-dev/
├── src/
│   ├── core.ts          # Shared logic for 4D operations
│   ├── index.ts         # MCP server entry point
│   └── extension.ts     # VS Code extension entry point
├── dist/                # Compiled JavaScript
├── package.json         # Dual-mode configuration
└── README.md           # Complete documentation
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3a. Use as MCP Server
```bash
npm start
# Or directly:
./dist/index.js
```

Configure in your MCP client (e.g., Claude Desktop):
```json
{
  "mcpServers": {
    "4d": {
      "command": "/path/to/mcp-4d-dev/dist/index.js"
    }
  }
}
```

### 3b. Use as VS Code Extension

#### Option 1: Development Mode
1. Open this project in VS Code
2. Press `F5` to launch Extension Development Host
3. In the new VS Code window, open Command Palette (`Cmd+Shift+P`)
4. Try commands:
   - "4D: Open Project in 4D IDE"
   - "4D: Open Current File in 4D IDE"

#### Option 2: Install as Extension
```bash
npm run package
# This creates mcp-4d-0.1.0.vsix
```

Then install:
1. In VS Code, go to Extensions
2. Click "..." menu → "Install from VSIX..."
3. Select the `.vsix` file

## VS Code Commands

### 4D: Open Project in 4D IDE
- **Command Palette**: Opens file picker for `.4DProject` files
- **Context Menu**: Right-click any `.4DProject` file in Explorer

### 4D: Open Current File in 4D IDE  
- **Command Palette**: Opens current file if it's `.4dm` or `.4DProject`
- **Editor Context Menu**: Right-click in editor with `.4dm` file
- **Explorer Context Menu**: Right-click any `.4dm` file

## Configuration

Set the `FOURD_APP` environment variable to specify your 4D application path:
```bash
export FOURD_APP="/Applications/4D v20 R6/4D.app"
```

Otherwise, the tool will auto-discover 4D on macOS.

## Development

- **Watch mode**: `npm run dev`
- **Type check**: `npm run typecheck`
- **Build**: `npm run build`
- **Package extension**: `npm run package`

## Notes

- Currently macOS only
- Requires 4D to be installed
- Works with `.4DProject` and `.4dm` files
- Auto-discovers 4D via Spotlight (mdfind) if not configured
