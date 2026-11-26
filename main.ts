// Funniest Forecast for a City That Isn't — make.fun entry.
// Writes a single-line weather forecast for the invented city
// Nimbopolis to /output/entry.txt. Gate: UTF-8 text, 1-120 chars,
// single line, not only whitespace.
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "Nimbopolis: scattered showers, one dramatic thunderstorm, and a rainbow that still owes us money.";

const MIN_CHARS = 1;
const MAX_CHARS = 120;
const MAX_BYTES = 480; // 120 chars x 4 bytes worst case

function validateGate(text: string): void {
  // Fail fast: reject anything the sealed gate would refuse.
  if (text.startsWith("﻿")) {
    throw new Error("gate failed: entry starts with a BOM");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (code < 0x20 && ch !== "\t") {
      throw new Error("gate failed: entry contains a control character");
    }
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate failed: entry must be a single line");
  }
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > MAX_BYTES) {
    throw new Error(`gate failed: entry is ${bytes} bytes, cap is ${MAX_BYTES}`);
  }
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    throw new Error("gate failed: entry is not a clean UTF-8 round-trip");
  }
  const chars = [...text].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(`gate failed: entry is ${chars} chars, must be ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: entry is only whitespace");
  }
}

function main(): void {
  validateGate(ENTRY);

  // Empty only the contents of /output (never remove the directory itself).
  mkdirSync("/output", { recursive: true });
  for (const name of readdirSync("/output")) {
    rmSync(`/output/${name}`, { recursive: true, force: true });
  }

  writeFileSync("/output/entry.txt", ENTRY, "utf8");

  const back = readFileSync("/output/entry.txt", "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt does not hold the entry");
  }
  const chars = [...back].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(`gate failed: entry is ${chars} chars, must be ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (back.trim().length === 0) {
    throw new Error("gate failed: entry is only whitespace");
  }
  const digest = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote /output/entry.txt (${chars} chars, sha256 ${digest})`);
}

main();
