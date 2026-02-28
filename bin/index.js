#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const command = process.argv[2];

if (!command) {
  console.log("");
  console.log("  Usage:");
  console.log("  create-stack-rem init             → Full-stack project");
  console.log("  create-stack-rem init:backend     → Backend only");
  console.log("  create-stack-rem init:frontend    → Frontend only");
  console.log("");
  process.exit(1);
}

/* ── Tiny colour helpers (no dependencies) ── */
const c = {
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
  reset:  "\x1b[0m",
};

/* ── Banner ── */
function printBanner() {
  console.log("");
  console.log(c.cyan("  ╔══════════════════════════════════════╗"));
  console.log(c.cyan("  ║") + c.bold("        create-stack-rem  ⚡         ") + c.cyan(" ║"));
  console.log(c.cyan("  ║") + c.dim("   Node.js + Express · React + Vite  ") + c.cyan(" ║"));
  console.log(c.cyan("  ╚══════════════════════════════════════╝"));
  console.log("");
}

/* ── Prompt helper ── */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/* ── Validate project name ── */
function validateName(name) {
  if (!name) return "Project name cannot be empty.";
  if (!/^[a-zA-Z0-9_-]+$/.test(name))
    return "Only letters, numbers, hyphens and underscores are allowed.";
  if (fs.existsSync(path.join(process.cwd(), name)))
    return `Folder "${name}" already exists in this directory.`;
  return null;
}

/* ── Main ── */
async function main() {
  printBanner();

  /* Ask for project name interactively */
  let projectName = "";
  while (true) {
    projectName = await prompt(c.cyan("  ? ") + c.bold("Project name: "));
    const err = validateName(projectName);
    if (!err) break;
    console.log(c.yellow(`  ⚠  ${err} Please try again.\n`));
  }

  const rootPath   = process.cwd();
  const projectPath = path.join(rootPath, projectName);

  console.log("");
  console.log(c.dim(`  Creating project in ./${projectName} ...`));
  console.log("");

  /* Create root folder */
  fs.mkdirSync(projectPath);

  /* ── BACKEND ── */
  const runBackend = command === "init:backend" || command === "init";
  if (runBackend) {
    const backendTemplate = path.join(__dirname, "../templates/backend");
    const backendPath     = path.join(projectPath, "backend");

    process.stdout.write(c.cyan("  ▸ ") + "Copying backend template ...  ");
    fs.cpSync(backendTemplate, backendPath, { recursive: true });
    console.log(c.green("done"));

    process.stdout.write(c.cyan("  ▸ ") + "Installing backend dependencies ...  ");
    process.chdir(backendPath);
    execSync("npm install express nodemon", { stdio: "ignore" });
    console.log(c.green("done"));
  }

  /* ── FRONTEND ── */
  const runFrontend = command === "init:frontend" || command === "init";
  if (runFrontend) {
    const frontendTemplate = path.join(__dirname, "../templates/frontend");
    const frontendPath     = path.join(projectPath, "frontend");

    process.stdout.write(c.cyan("  ▸ ") + "Copying frontend template ...  ");
    fs.cpSync(frontendTemplate, frontendPath, { recursive: true });
    console.log(c.green("done"));

    process.stdout.write(c.cyan("  ▸ ") + "Installing frontend dependencies ...  ");
    process.chdir(frontendPath);
    execSync("npm install", { stdio: "ignore" });
    console.log(c.green("done"));
  }

  /* ── Success message ── */
  console.log("");
  console.log(c.green("  ✔  Project created successfully!"));
  console.log("");

  if (command === "init") {
    console.log(c.bold("  Next steps:"));
    console.log(c.dim(`  cd ${projectName}/backend  `) + c.yellow("→  npm run dev"));
    console.log(c.dim(`  cd ${projectName}/frontend `) + c.yellow("→  npm run dev"));
  } else if (command === "init:backend") {
    console.log(c.bold("  Next steps:"));
    console.log(c.dim(`  cd ${projectName}/backend  `) + c.yellow("→  npm run dev"));
  } else if (command === "init:frontend") {
    console.log(c.bold("  Next steps:"));
    console.log(c.dim(`  cd ${projectName}/frontend `) + c.yellow("→  npm run dev"));
  }

  console.log("");
}

main().catch((err) => {
  console.error("\n  ✖  Something went wrong:", err.message);
  process.exit(1);
});