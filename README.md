# 🚀 StackRem - Full-Stack Project Generator CLI

> **StackRem** is a powerful CLI tool that instantly scaffolds modern full-stack applications with structured frontend and backend setup — directly from your terminal.

![Platform](https://img.shields.io/badge/Platform-Node.js-green)
![CLI](https://img.shields.io/badge/Type-CLI-blue)
![Status](https://img.shields.io/badge/Status-Local%20Development-orange)
![License](https://img.shields.io/badge/License-ISC-lightgrey)

---

## 📌 Current Status

⚠️ StackRem is currently configured for **local development only**.  
Global npm publishing will be added in a future release.

---

## 🖥 Screenshots

<table>
  <tr>
    <td width="50%">
      <h3 align="center">Landing Page</h3>
      <img src="./assets/landing.png" width="100%" />
      <p align="center"><em>Generated frontend landing page structure</em></p>
    </td>
    <td width="50%">
      <h3 align="center">Terminal CLI</h3>
      <img src="./assets/terminal.png" width="100%" />
      <p align="center"><em>Interactive CLI experience using Inquirer</em></p>
    </td>
  </tr>
</table>


---

## 🚀 What StackRem Does

StackRem helps developers instantly bootstrap:

- 📦 Full-Stack project
- ⚛️ Frontend-only project
- 🚀 Backend-only project

All with clean structure and zero manual setup.

## 🧠 How It Works

You run a command from the terminal.StackRem asks configuration questions.It generates the project folder structure.You're ready to start building immediately.

## ⚙️ Local Setup

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd stack-rem
```
## 2️⃣ Install dependencies
npm install
## 3️⃣ Link CLI locally
```bash
npm link
```
## 3️⃣ Run 
```bash
create-stack-rem init
```

## 🛠 Available Commands

<table>
  <tr>
    <td width="33%" align="center">
      <h3>Full-Stack</h3>
      <code>create-stack-rem init</code><br></br>
      <p><em>Generate complete full-stack project</em></p>
    </td>
    <td width="33%" align="center">
      <h3>Backend Only</h3>
      <code>create-stack-rem init:backend</code><br></br>
      <p><em>Generate backend-only project</em></p>
    </td>
    <td width="33%" align="center">
      <h3>Frontend Only</h3>
      <code>create-stack-rem init:frontend</code><br></br>
      <p><em>Generate frontend-only project</em></p>
    </td>
  </tr>
</table>


## Tech Stack
Core

Node.js

Commander

Inquirer

Generated Stack (Example)

Express.js

Vite / React (Frontend-ready structure)

## 📁 Example Generated Structure
```bash 
my-app/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   └── controllers/
│   └── server.js
│
└── frontend/
    ├── src/
    ├── public/
    └── vite.config.js
```
## 👨‍💻 Author

Mounasuvra Banerjee

## 📄 License

ISC License

---
## 🚀 Built for developers who want to start faster.



If you want next level version (like trending GitHub CLI repos with animated GIF preview, architecture diagram, contribution section, npm publish badge, etc.) — I can create that too 
