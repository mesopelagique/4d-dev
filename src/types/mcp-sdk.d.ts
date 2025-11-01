declare module "@modelcontextprotocol/sdk/dist/esm/server/mcp.js" {
  export class McpServer {
    server: any;
    constructor(...args: any[]);
    connect(...args: any[]): Promise<void>;
    close(...args: any[]): Promise<void>;
    registerTool(name: string, config: any, cb: (...args: any[]) => any): any;
    tool(name: string, ...rest: any[]): any;
    sendLoggingMessage(...args: any[]): Promise<void>;
    sendResourceListChanged(): void;
    sendToolListChanged(): void;
    sendPromptListChanged(): void;
  }
}

declare module "@modelcontextprotocol/sdk/dist/esm/server/stdio.js" {
  export class StdioServerTransport {
    constructor(...args: any[]);
  }
}
