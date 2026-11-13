// Checks everything in this repository a modder might copy:
//
//   node tools/check.mjs
//
// - Type-checks every example against smart-fellas.d.ts, with the options in tsconfig.json:
//   each file in examples/ on its own, the mode template's scripts as the game loads them
//   (its own scripts with shared/, and client/ with shared/), and every ```ts code block in README.md,
//   mode_template/README.md and wiki/ on its own. The Reference pages' blocks are the types' own
//   lines, so they are checked by matching the types instead.
// - Refuses what the game refuses or lacks in a script: import, export, require, enum, namespace,
//   constructor parameter fields, Date and Math.random.
// - Checks the wiki's reference pages still match the types (tools/reference.mjs).
//
// It says each problem as file:line, and fails if there are any.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { staleReferencePages } from "./reference.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = join(root, "smart-fellas.d.ts");
const problems = [];

/** The compiler options a modder's editor uses: those in tsconfig.json. */
function options() {
  const path = join(root, "tsconfig.json");
  const read = ts.readConfigFile(path, ts.sys.readFile);
  if (read.error) {
    throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, "\n"));
  }
  const parsed = ts.convertCompilerOptionsFromJson(read.config.compilerOptions, root);
  return { ...parsed.options, noEmit: true, types: [] };
}

/**
 * One piece of code to check: `name` is the file it is reported against, and `firstLine` the line
 * there its first line is on (0 for a whole file).
 */
function unit(name, code, firstLine = 0) {
  return { name, code, firstLine };
}

/** The ```ts blocks in a Markdown file, each as a unit. */
function blocksIn(path) {
  const lines = readFileSync(path, "utf8").split("\n");
  const found = [];
  let open = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (open === null && /^```(ts|typescript)\s*$/.test(line.trim())) {
      open = { start: index + 1, code: [] };
    } else if (open !== null && line.trim() === "```") {
      found.push(unit(relative(root, path), open.code.join("\n"), open.start));
      open = null;
    } else if (open !== null) {
      open.code.push(line);
    }
  }
  if (open !== null) {
    problems.push(`${relative(root, path)}:${open.start}: this code block is never closed.`);
  }
  return found;
}

function filesIn(folder, wanted) {
  if (!existsSync(folder)) {
    return [];
  }
  return readdirSync(folder)
    .filter((name) => wanted(name) && statSync(join(folder, name)).isFile())
    .sort()
    .map((name) => join(folder, name));
}

const isScript = (name) => name.endsWith(".ts") && !name.endsWith(".d.ts");

/**
 * Type-checks `groups` against the types: each group is one world, its units loaded side by side as
 * the game loads a folder's scripts, so they share their globals. Units in different groups never
 * meet.
 */
function typeCheck(groups) {
  const virtual = new Map();
  const where = new Map();
  groups.forEach((group, groupIndex) => {
    group.forEach((piece, pieceIndex) => {
      const path = join(root, ".check", `world${groupIndex}`, `${pieceIndex}.ts`);
      virtual.set(path, piece.code);
      where.set(path, piece);
    });
  });
  const compilerOptions = options();
  const host = ts.createCompilerHost(compilerOptions);
  const realGet = host.getSourceFile;
  // The standard library and the types are read once for every world.
  const read = new Map();
  host.getSourceFile = (path, language, ...rest) => {
    if (virtual.has(path)) {
      return ts.createSourceFile(path, virtual.get(path), language, true);
    }
    if (!read.has(path)) {
      read.set(path, realGet(path, language, ...rest));
    }
    return read.get(path);
  };
  host.fileExists = ((realExists) => (path) => virtual.has(path) || realExists(path))(host.fileExists);
  host.readFile = ((realRead) => (path) => virtual.get(path) ?? realRead(path))(host.readFile);

  for (const [index] of groups.entries()) {
    const names = [...virtual.keys()].filter((path) => path.includes(`${join(".check", `world${index}`)}/`));
    const program = ts.createProgram([TYPES, ...names], compilerOptions, host);
    for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
      const text = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      if (!diagnostic.file) {
        problems.push(`(no file): ${text}`);
        continue;
      }
      const piece = where.get(diagnostic.file.fileName);
      const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      const name = piece ? piece.name : relative(root, diagnostic.file.fileName);
      const at = piece ? piece.firstLine + line + 1 : line + 1;
      problems.push(`${name}:${at}: ${text}`);
    }
    for (const path of names) {
      refuseWhatTheGameLacks(program.getSourceFile(path), where.get(path));
    }
  }
}

/** Things a script can't have in the game, though TypeScript takes them. */
function refuseWhatTheGameLacks(source, piece) {
  const say = (node, what) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    problems.push(`${piece.name}:${piece.firstLine + line + 1}: ${what}`);
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) {
      say(node, "a script can't import: the game loads every script in the folder itself.");
    } else if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
      say(node, "a script can't export: what one script defines at its top the others can use.");
    } else if (node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      say(node, "a script can't export: what one script defines at its top the others can use.");
    } else if (ts.isEnumDeclaration(node)) {
      say(node, "the game refuses enum: use a union of strings, such as type Mood = \"calm\" | \"angry\".");
    } else if (ts.isModuleDeclaration(node)) {
      say(node, "the game refuses namespace: use plain objects and functions.");
    } else if (ts.isParameter(node) && node.modifiers?.length && ts.isConstructorDeclaration(node.parent)) {
      say(node, "the game refuses constructor parameter fields: declare the field and set it in the constructor.");
    } else if (ts.isIdentifier(node) && node.text === "Date" && !ts.isPropertyAccessExpression(node.parent)) {
      say(node, "a script has no clock: use game.seconds or game.ticks, not Date.");
    } else if (ts.isPropertyAccessExpression(node) && node.getText(source) === "Math.random") {
      say(node, "a script has no Math.random: use game.random(), which every player's game agrees on.");
    } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "require") {
      say(node, "a script can't load other code: the game loads every script in the folder itself.");
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

const units = (paths) => paths.map((path) => unit(relative(root, path), readFileSync(path, "utf8")));

const groups = [];
// Each map script example is a map of its own.
for (const path of filesIn(join(root, "examples"), isScript)) {
  groups.push(units([path]));
}
// The mode template, as the game loads it: the host's world, and each player's.
const scripts = join(root, "mode_template", "scripts");
const shared = units(filesIn(join(scripts, "shared"), isScript));
groups.push([...shared, ...units(filesIn(scripts, isScript))]);
const client = units(filesIn(join(scripts, "client"), isScript));
if (client.length > 0) {
  groups.push([...shared, ...client]);
}
// Every code block in the docs is a whole script on its own.
const docs = [join(root, "README.md"), join(root, "mode_template", "README.md"), ...filesIn(join(root, "wiki"), (name) => name.endsWith(".md") && !name.startsWith("Reference"))];
let blocks = 0;
for (const path of docs.filter((path) => existsSync(path))) {
  for (const block of blocksIn(path)) {
    groups.push([block]);
    blocks += 1;
  }
}
typeCheck(groups);

for (const name of staleReferencePages()) {
  problems.push(`wiki/${name}: doesn't match smart-fellas.d.ts. Run: npm run reference`);
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(problem);
  }
  console.error(`${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
  process.exit(1);
}
console.log(`Checked ${groups.length} scripts (${blocks} from the docs) against the types: all fine.`);
