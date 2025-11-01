````markdown
# 4D-Dev

**MCP server and VS Code extension** to interact with the 4D IDE from your AI assistant or directly from VS Code.

It provides tools to:
- Open a `.4DProject` in 4D
- Open one or more `.4dm` files in 4D

The 4D application path is resolved as follows:
1. If an explicit `appPath` argument is provided to the tool, use it.
2. Otherwise, if the `FOURD_APP` environment variable is set, use that.
3. Otherwise, on macOS, try to locate 4D via `mdfind` using CFBundleIdentifier `com.4D.4D`.
4. If still not found, fall back to `open -b com.4D.4D <file>` (launch by bundle id).

> Note: This currently targets macOS only.

---

## Installation

```bash
npm install
npm run build
```

---

## Usage

### As an MCP Server

Typical MCP clients will launch this as a stdio server. For manual testing:

```bash
npm start
```

This will start the server on stdio and wait for a client to connect.

#### MCP Tools

##### openProject
- **Description**: Open a 4D project (.4DProject) in the 4D IDE.
- **Input**:
  - `projectPath` (string, required): Absolute or relative path to a `.4DProject` file
  - `appPath` (string, optional): Path to `4D.app`. If omitted, `FOURD_APP` or `mdfind` discovery is used.

Example call payload (conceptual):
```json
{
  "tool": "openProject",
  "params": { "projectPath": "/path/to/MyApp/Project/MyApp.4DProject" }
}
```

##### openMethod
- **Description**: Open one or more 4D method files (.4dm) in the 4D IDE.
- **Input**:
  - `methodPaths` (string[], required): One or more `.4dm` file paths (absolute or relative)
  - `appPath` (string, optional): Path to `4D.app`. If omitted, `FOURD_APP` or `mdfind` discovery is used.

Example call payload (conceptual):
```json
{
  "tool": "openMethod",
  "params": { "methodPaths": ["Project/Sources/Methods/Foo.4dm", "Project/Sources/Methods/Bar.4dm"] }
}
```

---

### As a VS Code Extension

#### Installation

There are three ways to install and use the extension:

##### Option 1: Install the Pre-built Extension

1. Build and package the extension:
   ```bash
   npm install
   npm run build
   npm run package
   ```
   This creates `4d-dev-0.1.0.vsix` in the project root.

2. Install the extension:
   ```bash
   code --install-extension 4d-dev-0.1.0.vsix
   ```
   
   Or manually in VS Code:
   - Open VS Code
   - Go to Extensions (`Cmd+Shift+X`)
   - Click the "..." menu → "Install from VSIX..."
   - Select the `4d-dev-0.1.0.vsix` file

3. Reload VS Code if prompted

##### Option 2: Development Mode (for testing)

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Press `F5` in VS Code to launch the Extension Development Host for testing.

##### Option 3: Publish to VS Code Marketplace

(For public distribution - requires a VS Code publisher account)
```bash
npm run build
vsce publish
```

#### Features

The extension provides two commands available via the Command Palette (`Cmd+Shift+P` on macOS):

1. **4D: Open Project in 4D IDE**
   - Opens a `.4DProject` file in the 4D IDE
   - Automatically searches for projects in the workspace's `Project/` folder
   - Can be invoked from:
     - Command Palette (auto-discovers projects)
     - Right-click context menu on `.4DProject` files in the Explorer

2. **4D: Open Current File in 4D IDE**
   - Opens the current `.4dm` or `.4DProject` file in the 4D IDE
   - Can be invoked from:
     - Command Palette (uses active editor)
     - Right-click context menu on `.4dm` files in the Explorer or Editor
     - Works anywhere you have a 4D file open or selected

3. **4D: Enable MCP Server**
   - Automatically registers the MCP server for use with AI assistants
   - Configures Claude Desktop or other MCP clients to use this extension

4. **4D: Disable MCP Server**
   - Unregisters the MCP server from AI assistants

#### Settings

Configure the extension via VS Code Settings (`Cmd+,`):

- **`4d-dev.applicationPath`**: Path to 4D.app (e.g., `/Applications/4D v20 R6/4D.app`)
  - If empty, the extension will auto-discover 4D via Spotlight
  - This setting is used by both the VS Code extension and the MCP server

- **`4d-dev.enableMcpServer`**: Enable/disable the MCP server
  - When enabled, automatically registers this extension with your MCP client (e.g., Claude Desktop)
  - The extension will appear in your AI assistant's available tools
  - Default: `false`

#### MCP Server Auto-Registration

This extension can automatically register itself as an MCP server for AI assistants:

1. Open VS Code Settings (`Cmd+,`)
2. Search for "4D"
3. Check **"Enable Mcp Server"**
4. Optionally set **"Application Path"** to your 4D.app location
5. Restart your MCP client (e.g., Claude Desktop)

The extension will automatically configure your MCP client to use the 4D tools!

#### Usage Examples

**Opening a 4D Project:**
1. Open Command Palette (`Cmd+Shift+P`)
2. Type "4D: Open Project"
3. Select your `.4DProject` file
4. The project opens in 4D IDE

**Opening a 4D Method:**
1. Open a `.4dm` file in VS Code
2. Open Command Palette (`Cmd+Shift+P`)
3. Type "4D: Open Current File"
4. The method opens in 4D IDE

**Or simply:**
- Right-click any `.4dm` or `.4DProject` file in the Explorer
- Select the appropriate command from the context menu

---

## Environment

- `FOURD_APP` (optional): Absolute path to 4D.app (e.g., `/Applications/4D 20 R5/4D.app`). If set, discovery is skipped.

## Discovery Details

When no `appPath` argument is passed and `FOURD_APP` is not defined, the server/extension executes:

```bash
mdfind "kMDItemCFBundleIdentifier == 'com.4D.4D'"
```

The first `.app` result under `/Applications` is preferred.
If nothing is found, it falls back to `open -b com.4D.4D <file>`.

## Notes

- This uses macOS `open` to launch files in 4D.
- `.4DProject` files reliably open the corresponding project.
- `.4dm` files are registered to 4D per the app's Info.plist and should open in the 4D IDE.
- Non-macOS platforms currently throw a descriptive error.

## Development

- **Build**: `npm run build`
- **Watch mode**: `npm run dev`
- **Type check**: `npm run typecheck`
- **Package extension**: `npm run package`

````
