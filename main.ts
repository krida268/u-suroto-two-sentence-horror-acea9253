// Two-Sentence Horror — a program that writes one horror story,
// in exactly two sentences, to /output/entry.txt.
//
// The story is a fixed text on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly those two
// sentences, byte for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this story, against the judge's brief:
// - It is a horror story in exactly two sentences: a warm domestic
//   ritual in the first, and a turn in the second that makes the
//   ritual worse on a second read — the husband's note admits he
//   knows something else in the house is copying him.
// - The horror is implied, never explained: nothing says what packed
//   the other lunch, or what is in it. The reader fills in the worst.
// - The prose is precise and concrete: evening, night shift, fridge,
//   the note on the bag, the one on the left. Every word earns its
//   place, and the story ends on its strongest beat — "don't touch
//   the other one."
// - It is fresh: no mirror, no doll, no basement, no dead relative
//   calling. A lunchbox, of all things, is where the dread lives.
const STORY =
  "My husband packs my lunch every evening before my night shift, and he always writes a little note on the bag. Tonight there were two lunches in the fridge, and his note said, 'I packed the one on the left — don't touch the other one.'";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate only accepts 1 to 400 characters of UTF-8 text, so refuse
  // loudly instead of shipping a text the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (STORY.length < 1 || STORY.length > 400) {
    throw new Error(`entry must be 1-400 characters, got ${STORY.length}`);
  }
  if (STORY.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // No leading or trailing white space either: the gate counts every
  // byte, and a stray space at either end would sit in front of the
  // judge for nothing.
  if (STORY !== STORY.trim()) {
    throw new Error("entry must not have leading or trailing white space");
  }
  // Exactly two sentences: count the sentence-ending marks. The quoted
  // note carries no period of its own, so the count is the story's.
  const terminators = STORY.match(/[.!?]/g) ?? [];
  if (terminators.length !== 2) {
    throw new Error(`entry must be exactly two sentences, got ${terminators.length} terminators`);
  }
  // The judge weighs the turn in the second sentence, so refuse
  // loudly if the story ever stops ending on its strongest beat:
  // the warning about the other lunch is the punch, and the story
  // must keep landing on it.
  if (!STORY.includes("don't touch the other one")) {
    throw new Error("entry must end on the warning about the other lunch");
  }
  // No invisible control characters for the same reason: the story must
  // read cleanly, exactly as written.
  if (/[\u0000-\u001f\u007f]/.test(STORY)) {
    throw new Error("entry must not contain control characters");
  }
  // Two sentences means one block of text: no line break hiding
  // inside it, and no tabs or doubled spaces either, so the story
  // reads as a single breath in front of the judge.
  if (/[\n\r]/.test(STORY)) {
    throw new Error("entry must not contain line breaks");
  }
  if (/[\t]/.test(STORY) || /  /.test(STORY)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // The gate counts every byte, so write exactly the story and
  // nothing else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, STORY, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the story: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== STORY) {
    throw new Error("entry file does not hold exactly the story");
  }
  console.log(`Wrote ${STORY.length} characters to ${OUT_FILE}`);
}

main();
