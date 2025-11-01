import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const BUNDLE_ID = "com.4D.4D"; // From Info.plist

/**
 * Find 4D.app according to the rules:
 * 1) Respect env var FOURD_APP when provided (path to .app)
 * 2) On macOS, try `mdfind kMDItemCFBundleIdentifier == 'com.4D.4D'`
 * 3) As a last resort, rely on `open -b com.4D.4D` (no explicit path)
 */
export function find4DAppPath(preferred?: string): string | null {
  if (preferred && fs.existsSync(preferred)) {
    return preferred;
  }

  const envPath = process.env.FOURD_APP;
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }

  if (process.platform === "darwin") {
    try {
      const query = "kMDItemCFBundleIdentifier == '" + BUNDLE_ID + "'";
      const res = spawnSync("mdfind", [query], { encoding: "utf8" });
      if (res.status === 0 && res.stdout) {
        const candidates = res.stdout
          .split(/\r?\n/)
          .map((s: string) => s.trim())
          .filter((p: string) => Boolean(p))
          .filter((p: string) => p.endsWith(".app"));

        // Prefer ones under /Applications, keep stable order
        const sorted = candidates.sort((a: string, b: string) => {
          const aApps = a.startsWith("/Applications") ? 0 : 1;
          const bApps = b.startsWith("/Applications") ? 0 : 1;
          if (aApps !== bApps) return aApps - bApps;
          return a.localeCompare(b);
        });
        if (sorted.length > 0) {
          return sorted[0];
        }
      }
    } catch {
      // ignore
    }
  }

  return null; // Signals we should fallback to open -b
}

/**
 * Open a file (project or method) with 4D on macOS
 */
export async function macOpenWithApp(appPath: string | null, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = appPath ? ["-a", appPath, filePath] : ["-b", BUNDLE_ID, filePath];
    const child = spawn("open", args);
    child.on("error", reject);
    child.on("close", (code: number | null) => {
      if (code === 0) resolve();
      else reject(new Error(`open exited with code ${code}`));
    });
  });
}

/**
 * Ensure we're running on macOS
 */
export function ensureMac(): void {
  if (process.platform !== "darwin") {
    throw new Error("This tool currently supports macOS only.");
  }
}

/**
 * Ensure a file exists
 */
export function ensureExists(fp: string): void {
  if (!fs.existsSync(fp)) {
    throw new Error(`File not found: ${fp}`);
  }
}

/**
 * Resolve a path, expanding ~ to home directory
 */
export function resolvePath(p: string): string {
  if (p.startsWith("~")) {
    return path.resolve(os.homedir(), p.slice(1));
  }
  return path.resolve(p);
}

/**
 * Open a 4D project (.4DProject) in the 4D IDE
 */
export async function openProject(projectPath: string, appPath?: string): Promise<string> {
  ensureMac();
  const proj = resolvePath(projectPath);
  ensureExists(proj);
  if (!proj.toLowerCase().endsWith(".4dproject")) {
    throw new Error("projectPath must point to a .4DProject file");
  }

  const app = find4DAppPath(appPath);
  await macOpenWithApp(app, proj);

  return app
    ? `Opened project in 4D: ${proj} (app: ${app})`
    : `Opened project in 4D via bundle id (${BUNDLE_ID}): ${proj}`;
}

/**
 * Open one or more 4D method files (.4dm) in the 4D IDE
 */
export async function openMethod(methodPaths: string[], appPath?: string): Promise<string> {
  ensureMac();
  const resolved = methodPaths.map((p: string) => {
    const fp = resolvePath(p);
    ensureExists(fp);
    if (!fp.toLowerCase().endsWith(".4dm")) {
      throw new Error(`Not a .4dm file: ${fp}`);
    }
    return fp;
  });

  const app = find4DAppPath(appPath);

  for (const fp of resolved) {
    await macOpenWithApp(app, fp);
  }

  return (
    (app
      ? `Opened in 4D (app: ${app}):\n`
      : `Opened in 4D via bundle id (${BUNDLE_ID}):\n`) + resolved.join("\n")
  );
}

export { BUNDLE_ID };
