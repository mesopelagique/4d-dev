#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { openProject, openMethod } from "./core.js";

const mcpServer = new McpServer({
  name: "4d-dev",
  version: ((globalThis as any).process?.env?.npm_package_version as string) || "0.1.0"
});

// Tool: openProject
mcpServer.tool(
  "openProject",
  "Open a 4D project (.4DProject) in the 4D IDE.",
  {
    projectPath: z.string().describe("Absolute or relative path to a .4DProject file"),
    appPath: z.string().optional().describe("Optional path to 4D.app; otherwise FOURD_APP env or mdfind is used")
  },
  async (args: any) => {
    const { projectPath, appPath } = args;
    const result = await openProject(projectPath, appPath);
    
    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };
  }
);

// Tool: openMethod
mcpServer.tool(
  "openMethod",
  "Open one or more 4D method files (.4dm) in the 4D IDE.",
  {
    methodPaths: z
      .array(z.string())
      .min(1)
      .describe("One or more paths to .4dm files (absolute or relative)"),
    appPath: z.string().optional().describe("Optional path to 4D.app; otherwise FOURD_APP env or mdfind is used")
  },
  async (args: any) => {
    const { methodPaths, appPath } = args;
    const result = await openMethod(methodPaths, appPath);

    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}

main().catch((err) => {
  // Print a plain error for clients and exit non-zero
  console.error(String(err?.stack || err));
  process.exit(1);
});
