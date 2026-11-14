// Writes the wiki's reference pages from smart-fellas.d.ts, so they always say what the types say.
//
//   node tools/reference.mjs           write wiki/Reference*.md
//   node tools/reference.mjs --check   say which pages differ from what the types make, and fail if any do
//
// Each interface with calls on it (Game, Player, Zone, Piece, Creature) gets a page of its own. The
// timers get one, the helpers every script has (Vec, Maths, Random and the rest, in HELPERS) get one,
// every other type goes on Reference-Types.md, and Reference.md lists them all under the notes at the
// top of the types file. Never edit a Reference page by hand: change the types file.
import { readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = join(root, "smart-fellas.d.ts");
const WIKI = join(root, "wiki");
const PREFIX = "Reference";
/** The helpers' names: they go on Reference-Helpers.md, each with its parts listed under it. */
const HELPERS = new Set(["Vec", "Maths", "Random", "Easing", "Ease", "tween", "State", "StateMachine", "Store", "store", "log"]);
const STAMP = "<!-- Made by tools/reference.mjs from smart-fellas.d.ts. Don't edit: change the types file, then run npm run reference. -->";

/** The doc comment on a node, as plain Markdown text, or "". */
function docOf(node, source) {
  const parts = [];
  for (const doc of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(doc)) {
      continue;
    }
    const text = typeof doc.comment === "string" ? doc.comment : ts.getTextOfJSDocComment(doc.comment);
    if (text) {
      parts.push(text.trim());
    }
  }
  return parts.join("\n\n").replace(/\r/g, "");
}

/** A node's own text, without its doc comment, on one line where it fits. */
function signature(node, source) {
  return node
    .getText(source)
    .replace(/\/\*\*[\s\S]*?\*\//g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

function block(code) {
  return "```ts\n" + code + "\n```";
}

function memberName(member, source) {
  return member.name ? member.name.getText(source) : "(call)";
}

/** The page for one interface: each of its members in the file's own order. */
function interfacePage(node, source) {
  const name = node.name.text;
  const lines = [STAMP, "", `# ${name}`, ""];
  const doc = docOf(node, source);
  if (doc) {
    lines.push(doc, "");
  }
  const fields = node.members.filter((member) => ts.isPropertySignature(member));
  const calls = node.members.filter((member) => !ts.isPropertySignature(member));
  const section = (title, members) => {
    if (members.length === 0) {
      return;
    }
    lines.push(`## ${title}`, "");
    for (const member of members) {
      lines.push(`### ${memberName(member, source)}`, "", block(signature(member, source)), "");
      const said = docOf(member, source);
      if (said) {
        lines.push(said, "");
      }
    }
  };
  section("What you can read", fields);
  section("What you can call", calls);
  return lines.join("\n").trimEnd() + "\n";
}

/** A list of whole declarations under one heading each. */
function declarationsPage(title, intro, nodes, source) {
  const lines = [STAMP, "", `# ${title}`, "", intro, ""];
  for (const node of nodes) {
    lines.push(`## ${node.name.text}`, "", block(signature(node, source)), "");
    const said = docOf(node, source);
    if (said) {
      lines.push(said, "");
    }
  }
  return lines.join("\n").trimEnd() + "\n";
}

/** The members of a class, an interface, or a const whose type is written out as an object. */
function membersOf(node) {
  if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
    return [...node.members];
  }
  if (ts.isVariableStatement(node)) {
    const type = node.declarationList.declarations[0].type;
    if (type && ts.isTypeLiteralNode(type)) {
      return [...type.members];
    }
  }
  return [];
}

function nameOf(node) {
  return ts.isVariableStatement(node) ? node.declarationList.declarations[0].name.text : node.name.text;
}

/**
 * The helpers' page: each helper under a heading of its own, with its doc, and either its whole
 * declaration (when it is short) or each of its parts with theirs.
 */
function helpersPage(nodes, source) {
  const lines = [
    STAMP,
    "",
    "# Helpers",
    "",
    "Plain JavaScript every script has, on the host and on players' PCs alike. They change nothing in the match by themselves. See [Helpers](Helpers.md) for examples.",
    "",
  ];
  for (const node of nodes) {
    const name = nameOf(node);
    lines.push(`## ${name}`, "");
    const said = docOf(node, source);
    if (said) {
      lines.push(said, "");
    }
    const members = membersOf(node).filter((member) => docOf(member, source));
    if (members.length === 0) {
      lines.push(block(signature(node, source)), "");
      continue;
    }
    for (const member of members) {
      const label = ts.isConstructorDeclaration(member) ? `new ${name}` : `${name}.${memberName(member, source)}`;
      lines.push(`### ${label}`, "", block(signature(member, source)), "", docOf(member, source), "");
    }
  }
  return lines.join("\n").trimEnd() + "\n";
}

/** The plain // notes at the very top of the types file, as paragraphs and lists. */
function headerNotes(text) {
  const notes = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("//")) {
      break;
    }
    notes.push(line.replace(/^\/\/ ?/, ""));
  }
  // A line that carries on the one before it (indented under a "- " item) joins it.
  const joined = [];
  for (const line of notes) {
    if (/^ {2}\S/.test(line) && joined.length > 0 && joined.at(-1) !== "") {
      joined[joined.length - 1] += " " + line.trim();
    } else {
      joined.push(line);
    }
  }
  return joined.join("\n").trim();
}

/** Every reference page, by file name, as the types make them now. */
export function referencePages() {
  const text = readFileSync(TYPES, "utf8");
  const source = ts.createSourceFile(TYPES, text, ts.ScriptTarget.ES2023, true);
  const pages = new Map();
  const types = [];
  const timers = [];
  const globals = [];
  const own = [];
  const helpers = [];
  for (const statement of source.statements) {
    if ((statement.name || ts.isVariableStatement(statement)) && HELPERS.has(nameOf(statement))) {
      helpers.push(statement);
    } else if (ts.isInterfaceDeclaration(statement)) {
      if (statement.members.some((member) => ts.isMethodSignature(member))) {
        const page = `${PREFIX}-${statement.name.text}`;
        pages.set(`${page}.md`, interfacePage(statement, source));
        own.push({ page, name: statement.name.text, doc: docOf(statement, source) });
      } else {
        types.push(statement);
      }
    } else if (ts.isTypeAliasDeclaration(statement)) {
      (statement.name.text === "TimerId" ? timers : types).push(statement);
    } else if (ts.isFunctionDeclaration(statement)) {
      timers.push(statement);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        globals.push({ name: declaration.name.getText(source), code: signature(statement, source), doc: docOf(statement, source) });
      }
    }
  }
  pages.set(
    `${PREFIX}-Timers.md`,
    declarationsPage(
      "Timers",
      "Run something later, or again and again. Timers count the match's own time, so they keep step with the game. See [Timers](Timers.md) for examples.",
      timers,
      source,
    ),
  );
  pages.set(`${PREFIX}-Helpers.md`, helpersPage(helpers, source));
  pages.set(
    `${PREFIX}-Types.md`,
    declarationsPage("Types", "The smaller types the calls take and give back.", types, source),
  );

  const index = [STAMP, "", "# Reference", ""];
  index.push(
    "Every call a script can make, straight from `smart-fellas.d.ts`. These pages are made from that file each time it changes, so they always match it.",
    "",
  );
  if (globals.length > 0) {
    index.push("## Globals", "");
    for (const global of globals) {
      const page = own.find((entry) => global.code.includes(`: ${entry.name}`));
      index.push(`- \`${global.name}\`: ${global.doc || "a global"}${page ? ` See [${page.name}](${page.page}.md).` : ""}`);
    }
    index.push("- `after`, `every`, `cancel`: see [Timers](Reference-Timers.md).");
    index.push(`- ${helpers.map((node) => `\`${nameOf(node)}\``).join(", ")}: see [Helpers](${PREFIX}-Helpers.md).`, "");
  }
  index.push("## Pages", "");
  for (const entry of own) {
    const first = entry.doc.replace(/\s+/g, " ").split(/(?<=\.) /)[0];
    index.push(`- [${entry.name}](${entry.page}.md): ${first}`);
  }
  index.push(`- [Timers](${PREFIX}-Timers.md): \`after\`, \`every\` and \`cancel\`.`);
  index.push(`- [Helpers](${PREFIX}-Helpers.md): \`Vec\`, \`Maths\`, \`Random\`, \`tween\`, \`StateMachine\`, \`store\`, \`log\` and the rest.`);
  index.push(`- [Types](${PREFIX}-Types.md): the smaller types the calls take and give back.`, "");
  index.push("## Notes from the top of the types file", "", headerNotes(text), "");
  pages.set(`${PREFIX}.md`, index.join("\n").trimEnd() + "\n");
  return pages;
}

/** The reference pages in the wiki folder now. */
function pagesOnDisk() {
  return readdirSync(WIKI).filter((name) => name === `${PREFIX}.md` || (name.startsWith(`${PREFIX}-`) && name.endsWith(".md")));
}

/** The names of pages that differ from what the types make, or are left over. */
export function staleReferencePages() {
  const wanted = referencePages();
  const stale = [];
  for (const [name, text] of wanted) {
    let have = null;
    try {
      have = readFileSync(join(WIKI, name), "utf8");
    } catch {
      // Missing: stale.
    }
    if (have !== text) {
      stale.push(name);
    }
  }
  for (const name of pagesOnDisk()) {
    if (!wanted.has(name)) {
      stale.push(name);
    }
  }
  return stale;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--check")) {
    const stale = staleReferencePages();
    if (stale.length > 0) {
      console.error(`These reference pages don't match smart-fellas.d.ts: ${stale.join(", ")}.`);
      console.error("Run: npm run reference");
      process.exit(1);
    }
    console.log("The reference pages match the types.");
  } else {
    const wanted = referencePages();
    for (const name of pagesOnDisk()) {
      if (!wanted.has(name)) {
        rmSync(join(WIKI, name));
      }
    }
    for (const [name, text] of wanted) {
      writeFileSync(join(WIKI, name), text);
    }
    console.log(`Wrote ${wanted.size} reference pages.`);
  }
}
