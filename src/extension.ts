import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs";
import { openProject, openMethod } from "./core.js";

/**
 * Get the configured 4D application path from settings
 */
function get4DAppPath(): string | undefined {
  const config = vscode.workspace.getConfiguration("4d-dev");
  const appPath = config.get<string>("applicationPath");
  return appPath && appPath.trim() !== "" ? appPath : undefined;
}

/**
 * MCP Server Definition Provider for 4D
 */
class FourDMcpServerProvider implements vscode.McpServerDefinitionProvider {
  provideMcpServerDefinitions(): vscode.ProviderResult<vscode.McpServerDefinition[]> {
    const extensionPath = vscode.extensions.getExtension("mesopelagique.4d-dev")?.extensionPath;
    if (!extensionPath) {
      return [];
    }

    const serverPath = path.join(extensionPath, "dist", "index.js");
    const appPath = get4DAppPath();

    const serverDefinition = new vscode.McpStdioServerDefinition(
      "4D IDE",
      "node",
      [serverPath],
      appPath ? { FOURD_APP: appPath } : undefined
    );

    return [serverDefinition];
  }
}

/**
 * Find .4DProject files in the workspace
 * Prioritizes files in "Project" folder
 */
async function find4DProjectFiles(): Promise<string[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return [];
  }

  const projectFiles: string[] = [];

  // First, look in Project folder of each workspace
  for (const folder of workspaceFolders) {
    const projectFolder = path.join(folder.uri.fsPath, "Project");
    if (fs.existsSync(projectFolder)) {
      const files = fs.readdirSync(projectFolder);
      for (const file of files) {
        if (file.toLowerCase().endsWith(".4dproject")) {
          projectFiles.push(path.join(projectFolder, file));
        }
      }
    }
  }

  // If found in Project folder, return those first
  if (projectFiles.length > 0) {
    return projectFiles;
  }

  // Otherwise, search entire workspace
  const uris = await vscode.workspace.findFiles("**/*.4DProject", "**/node_modules/**", 10);
  return uris.map(uri => uri.fsPath);
}

/**
 * Activate the VS Code extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "4d-dev" is now active!');

  // Register MCP Server Definition Provider
  const mcpProvider = vscode.lm.registerMcpServerDefinitionProvider(
    "4d-dev",
    new FourDMcpServerProvider()
  );
  context.subscriptions.push(mcpProvider);

  // Command: Open 4D Project
  const openProjectCommand = vscode.commands.registerCommand(
    "4d-dev.openProject",
    async (uri?: vscode.Uri) => {
      try {
        let projectPath: string | undefined;

        if (uri) {
          // Called from context menu with a specific file
          projectPath = uri.fsPath;
        } else {
          // Called from command palette - search for .4DProject files
          const foundProjects = await find4DProjectFiles();

          if (foundProjects.length === 0) {
            // No projects found, show file picker as fallback
            const fileUris = await vscode.window.showOpenDialog({
              canSelectFiles: true,
              canSelectFolders: false,
              canSelectMany: false,
              filters: {
                "4D Project": ["4DProject"]
              },
              title: "Select 4D Project File"
            });

            if (fileUris && fileUris.length > 0) {
              projectPath = fileUris[0].fsPath;
            }
          } else if (foundProjects.length === 1) {
            // Exactly one project found, use it
            projectPath = foundProjects[0];
          } else {
            // Multiple projects found, let user choose
            const items = foundProjects.map(p => ({
              label: path.basename(p),
              description: path.dirname(p),
              path: p
            }));

            const selected = await vscode.window.showQuickPick(items, {
              placeHolder: "Select a 4D project to open"
            });

            if (selected) {
              projectPath = selected.path;
            }
          }
        }

        if (!projectPath) {
          vscode.window.showWarningMessage("No 4D project file selected.");
          return;
        }

        const appPath = get4DAppPath();
        const result = await openProject(projectPath, appPath);
        vscode.window.showInformationMessage(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to open 4D project: ${message}`);
      }
    }
  );

  // Command: Open Current File in 4D
  const openCurrentFileCommand = vscode.commands.registerCommand(
    "4d-dev.openCurrentFileIn4D",
    async (uri?: vscode.Uri) => {
      try {
        let filePath: string | undefined;

        if (uri) {
          // Called from context menu
          filePath = uri.fsPath;
        } else {
          // Called from command palette - use active editor
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            filePath = editor.document.uri.fsPath;
          }
        }

        if (!filePath) {
          vscode.window.showWarningMessage("No file to open in 4D.");
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        
        const appPath = get4DAppPath();
        
        if (ext === ".4dm") {
          const result = await openMethod([filePath], appPath);
          vscode.window.showInformationMessage(result);
        } else if (ext === ".4dproject") {
          const result = await openProject(filePath, appPath);
          vscode.window.showInformationMessage(result);
        } else {
          vscode.window.showWarningMessage(
            `File "${path.basename(filePath)}" is not a 4D file (.4dm or .4DProject)`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to open file in 4D: ${message}`);
      }
    }
  );

  context.subscriptions.push(
    openProjectCommand,
    openCurrentFileCommand
  );
}

/**
 * Deactivate the VS Code extension
 */
export function deactivate() {
  // Cleanup if needed
}
