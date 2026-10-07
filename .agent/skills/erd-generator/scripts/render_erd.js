import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("SYNTAX_ERROR: No Mermaid input file provided.");
  process.exit(1);
}

const outputFile = path.resolve("docs/architecture/erd.svg");

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const result = spawnSync(
  "npx",
  ["mmdc", "-i", inputFile, "-o", outputFile],
  {
    encoding: "utf8",
    shell: process.platform === "win32",
  }
);

if (result.status === 0) {
  console.log("SUCCESS");
  process.exit(0);
}

const errorTrace =
  (result.stderr && result.stderr.trim()) ||
  (result.stdout && result.stdout.trim()) ||
  result.error?.message ||
  "Unknown Mermaid compilation error";

console.error(`SYNTAX_ERROR: ${errorTrace}`);
process.exit(1);
