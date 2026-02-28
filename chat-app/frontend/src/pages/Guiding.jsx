import React, { useState, useEffect } from "react";

/* ─────────────────────────── SVG ICONS ─────────────────────────── */
const IconFolder = ({ color = "#fbbf24" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 7C3 5.9 3.9 5 5 5h4l2 2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z"
      fill={color} fillOpacity="0.9" />
  </svg>
);
const IconFileJs = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="2" width="18" height="20" rx="3" fill="#1a2035" stroke="#2d3a55" strokeWidth="1.2" />
    <text x="5" y="17" fontSize="9" fontWeight="800" fontFamily="monospace" fill="#fbbf24">JS</text>
  </svg>
);
const IconFileJsx = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="2" width="18" height="20" rx="3" fill="#1a2035" stroke="#2d3a55" strokeWidth="1.2" />
    <text x="3.5" y="17" fontSize="7" fontWeight="800" fontFamily="monospace" fill="#38bdf8">JSX</text>
  </svg>
);
const IconFileJson = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="2" width="18" height="20" rx="3" fill="#1a2035" stroke="#2d3a55" strokeWidth="1.2" />
    <text x="2.5" y="17" fontSize="6" fontWeight="800" fontFamily="monospace" fill="#6ee7b7">JSON</text>
  </svg>
);
const IconRoot = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" strokeWidth="1.5" />
    <path d="M8 12h8M12 8v8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ─────────────────────────── FILE TREE ─────────────────────────── */
const TREE = [
  { label: "test-app2",           t: "root",   d: 0, last: false },
  { label: "backend",             t: "folder", d: 1, last: false, c: "#fbbf24" },
  { label: "src",                 t: "folder", d: 2, last: false, c: "#fbbf24" },
  { label: "controller",          t: "folder", d: 3, last: false, c: "#fbbf24" },
  { label: "auth.controller.js",  t: "js",     d: 4, last: false, c: "#818cf8" },
  { label: "user.controller.js",  t: "js",     d: 4, last: true,  c: "#818cf8" },
  { label: "db",                  t: "folder", d: 3, last: false, c: "#fbbf24" },
  { label: "connect.js",          t: "js",     d: 4, last: true,  c: "#a78bfa" },
  { label: "middleware",          t: "folder", d: 3, last: false, c: "#fbbf24" },
  { label: "login.middleware.js", t: "js",     d: 4, last: true,  c: "#f59e0b" },
  { label: "models",              t: "folder", d: 3, last: false, c: "#fbbf24" },
  { label: "user.models.js",      t: "js",     d: 4, last: true,  c: "#a78bfa" },
  { label: "routes",              t: "folder", d: 3, last: false, c: "#fbbf24" },
  { label: "auth.routes.js",      t: "js",     d: 4, last: false, c: "#6ee7b7" },
  { label: "user.routes.js",      t: "js",     d: 4, last: true,  c: "#6ee7b7" },
  { label: "utils",               t: "folder", d: 3, last: false, c: "#fbbf24" },
  { label: "generateToken.js",    t: "js",     d: 4, last: true,  c: "#f472b6" },
  { label: "server.js",           t: "js",     d: 3, last: true,  c: "#fbbf24" },
  { label: "frontend",            t: "folder", d: 1, last: false, c: "#38bdf8" },
  { label: "src",                 t: "folder", d: 2, last: false, c: "#38bdf8" },
  { label: "pages",               t: "folder", d: 3, last: false, c: "#38bdf8" },
  { label: "Guiding.jsx",         t: "jsx",    d: 4, last: true,  c: "#38bdf8" },
  { label: "components",          t: "folder", d: 3, last: false, c: "#38bdf8" },
  { label: "App.jsx",             t: "jsx",    d: 3, last: false, c: "#38bdf8" },
  { label: "main.jsx",            t: "jsx",    d: 3, last: true,  c: "#38bdf8" },
  { label: "vite.config.js",      t: "js",     d: 2, last: false, c: "#fbbf24" },
  { label: "package.json",        t: "json",   d: 2, last: true  },
  { label: "package.json",        t: "json",   d: 1, last: true  },
];

/*
 * For every row we precompute an array of booleans (length = node.depth).
 * openAtDepth[di] = true  → draw a full-height vertical bar at column di
 *                 = false → draw nothing at column di
 * The last column (di === d-1) is always the branch connector itself.
 *
 * Algorithm: scan forward from each row; for depth-column di,
 * a vertical bar is needed when there is any future row at depth <= di
 * that is NOT a descendant cut-off, i.e. we look for the next sibling.
 * Simplest correct way: for column di, draw a bar if there exists a
 * later row whose depth is >= di AND whose own "last" at depth di is false,
 * meaning we haven't consumed the parent's last child yet.
 *
 * We implement this with a simple "lastSeen" stack approach:
 * openLines[i][di] = does depth-column di still have a continuing vertical
 *                    line when rendering row i?
 */
function computeOpenLines(tree) {
  // openLines[rowIndex] = Set of depth-columns that should show a vertical bar
  const result = [];

  // We track, for each depth level, whether the parent's group is still "open"
  // (i.e. the last-seen node at that depth had last=false).
  // We walk forward and maintain a stack of "open" depth levels.
  // A depth d is open if the most recent node at that depth had last=false.
  const open = new Set(); // currently open depth levels

  for (let i = 0; i < tree.length; i++) {
    const { d, last } = tree[i];

    // When we encounter a node at depth d, close all depths > d
    // (they were children of a previous sibling that ended).
    for (const k of [...open]) {
      if (k >= d) open.delete(k);
    }

    // Record which columns get a vertical bar for THIS row.
    // For a node at depth d, columns 1..d-1 show a bar if that depth is still open.
    // Column d (the junction column) never gets a plain bar — it gets the branch symbol.
    result.push(new Set([...open]));

    // After recording, update open state for this depth:
    if (!last) open.add(d);
    else open.delete(d);
  }

  return result;
}

const OPEN_LINES = computeOpenLines(TREE);
const W = 20; // px per indent level
const LINE_X = 9; // x position of the vertical line within each W-wide column

function TreeRow({ node, rowIdx }) {
  const { d, t, label, c, last } = node;
  const openCols = OPEN_LINES[rowIdx]; // Set<number> of cols with a vertical bar

  const icon = t === "root"   ? <IconRoot />
             : t === "folder" ? <IconFolder color={c || "#fbbf24"} />
             : t === "jsx"    ? <IconFileJsx />
             : t === "json"   ? <IconFileJson />
             :                  <IconFileJs />;

  const labelColor = t === "root"   ? "#38bdf8"
                   : t === "folder" ? "#e2e8f0"
                   :                  (c || "#94a3b8");

  return (
    <div style={{ display: "flex", alignItems: "stretch", height: 26, position: "relative" }}>
      {/* Render one column per depth level (skip d=0, root has no indent) */}
      {d > 0 && Array.from({ length: d }).map((_, di) => {
        const isJunction = di === d - 1;
        const hasBar = openCols.has(di);   // ancestor col: show vertical bar?

        return (
          <div key={di} style={{ width: W, flexShrink: 0, position: "relative" }}>
            {isJunction ? (
              /* ── Junction column: vertical segment + horizontal arm ── */
              <>
                {/* Vertical segment: full-height if more siblings, half-height if last */}
                <div style={{
                  position: "absolute",
                  left: LINE_X,
                  top: 0,
                  height: last ? "50%" : "100%",
                  width: 1.5,
                  background: "rgba(100,116,139,0.45)",
                  borderRadius: 1,
                }} />
                {/* Horizontal arm to icon */}
                <div style={{
                  position: "absolute",
                  left: LINE_X,
                  top: "50%",
                  width: W - LINE_X,
                  height: 1.5,
                  background: "rgba(100,116,139,0.45)",
                  borderRadius: 1,
                }} />
              </>
            ) : (
              /* ── Ancestor column: draw vertical pass-through only if open ── */
              hasBar && (
                <div style={{
                  position: "absolute",
                  left: LINE_X,
                  top: 0,
                  bottom: 0,
                  width: 1.5,
                  background: "rgba(100,116,139,0.45)",
                  borderRadius: 1,
                }} />
              )
            )}
          </div>
        );
      })}

      {/* Icon + label — vertically centred */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, alignSelf: "center" }}>
        {icon}
        <span style={{
          fontSize: 11.5,
          fontFamily: "'JetBrains Mono', monospace",
          color: labelColor,
          fontWeight: (t === "folder" || t === "root") ? 600 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: "color 0.2s",
        }}>
          {label}{(t === "folder" || t === "root") ? "/" : ""}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── FLOWS ─────────────────────────── */
const LAYER = {
  frontend:   { color: "#38bdf8", label: "Frontend",   bg: "rgba(56,189,248,0.08)",   g: "⬡" },
  api:        { color: "#6ee7b7", label: "API Route",  bg: "rgba(110,231,183,0.08)",  g: "⟶" },
  backend:    { color: "#818cf8", label: "Controller", bg: "rgba(129,140,248,0.08)",  g: "⚙" },
  middleware: { color: "#f59e0b", label: "Middleware",  bg: "rgba(245,158,11,0.08)",   g: "⛨" },
  database:   { color: "#a78bfa", label: "Database",   bg: "rgba(167,139,250,0.08)",  g: "◈" },
};

const FLOWS = {
  signup: {
    label: "Signup Flow", icon: "✦", color: "#38bdf8",
    steps: [
      { id:"s0", layer:"frontend",  title:"Frontend Form",
        sub:"pages/Signup.jsx",
        desc:"User fills email, username & password. React state captures input.",
        code:"const [form, setForm] = useState({\n  username: '', email: '', password: ''\n});\nawait axios.post('/api/auth/signup', form);",
        inp:"User form data", out:"POST request body" },
      { id:"s1", layer:"api",       title:"POST /api/auth/signup",
        sub:"routes/auth.routes.js",
        desc:"Express router catches the request and passes it to the auth controller.",
        code:"router.post('/signup', signup);\n// backend/src/routes/auth.routes.js",
        inp:"{ username, email, password }", out:"Invokes signup controller" },
      { id:"s2", layer:"backend",   title:"Auth Controller",
        sub:"controllers/auth.controller.js",
        desc:"Validates input, hashes password with bcryptjs, creates user document.",
        code:"const salt = await bcrypt.genSalt(10);\nconst hashed = await bcrypt.hash(password, salt);\nconst user = new User({ username, email, password: hashed });\nawait user.save();",
        inp:"{ username, email, password }", out:"Saved User document" },
      { id:"s3", layer:"database",  title:"User Model",
        sub:"models/user.models.js",
        desc:"Mongoose schema validates and persists the new user to MongoDB.",
        code:"const userSchema = new Schema({\n  username: { type: String, required: true },\n  email:    { type: String, unique: true },\n  password: String,\n});",
        inp:"User data object", out:"MongoDB document _id" },
      { id:"s4", layer:"backend",   title:"Generate JWT Token",
        sub:"utils/generateToken.js",
        desc:"Signs a JWT with user._id payload, attaches as secure httpOnly cookie.",
        code:"const token = jwt.sign(\n  { userId: user._id },\n  process.env.JWT_SECRET,\n  { expiresIn: '7d' }\n);\nres.cookie('jwt', token, { httpOnly: true });",
        inp:"user._id", out:"Signed JWT string" },
      { id:"s5", layer:"frontend",  title:"Frontend Receives Response",
        sub:"pages / state update",
        desc:"Frontend stores user data, cookie auto-set by browser, user redirected.",
        code:"// Response: { _id, username, email }\nsetUser(data);\nnavigate('/dashboard');",
        inp:"HTTP 201 + user JSON", out:"Auth state updated" },
    ],
  },
  login: {
    label: "Login Flow", icon: "◈", color: "#818cf8",
    steps: [
      { id:"l0", layer:"frontend",  title:"Frontend Form",
        sub:"pages/Login.jsx",
        desc:"User enters credentials. Axios fires POST request to backend.",
        code:"await axios.post('/api/auth/login', { email, password });",
        inp:"email + password", out:"POST request body" },
      { id:"l1", layer:"api",       title:"POST /api/auth/login",
        sub:"routes/auth.routes.js",
        desc:"Router directs the request to the login controller handler.",
        code:"router.post('/login', login);",
        inp:"{ email, password }", out:"Invokes login controller" },
      { id:"l2", layer:"backend",   title:"Auth Controller – Login",
        sub:"controllers/auth.controller.js",
        desc:"Finds user by email, compares password hash using bcrypt.compare.",
        code:"const user = await User.findOne({ email });\nconst ok = await bcrypt.compare(password, user.password);\nif (!ok) throw new Error('Invalid credentials');",
        inp:"{ email, password }", out:"Validated user document" },
      { id:"l3", layer:"backend",   title:"Generate JWT Token",
        sub:"utils/generateToken.js",
        desc:"Issues a fresh JWT, attaches as httpOnly cookie in response.",
        code:"generateToken(user._id, res);\n// Sets 'jwt' cookie + returns user data",
        inp:"user._id", out:"Signed JWT cookie" },
      { id:"l4", layer:"frontend",  title:"Frontend Receives Response",
        sub:"Auth context",
        desc:"User state updated in context/store, redirect to protected route.",
        code:"setAuthUser(data);\nnavigate('/home');",
        inp:"HTTP 200 + user JSON", out:"Auth state hydrated" },
    ],
  },
  users: {
    label: "Get Users (Protected)", icon: "◉", color: "#a78bfa",
    steps: [
      { id:"u0", layer:"frontend",   title:"Authenticated API Call",
        sub:"components / hook",
        desc:"Frontend fires GET with credentials flag. Browser auto-sends JWT cookie.",
        code:"const res = await axios.get('/api/users', {\n  withCredentials: true\n});",
        inp:"Request + cookie", out:"GET /api/users" },
      { id:"u1", layer:"api",        title:"GET /api/users",
        sub:"routes/user.routes.js",
        desc:"Route guarded by isLoggedIn middleware before reaching controller.",
        code:"router.get('/', isLoggedIn, getUsers);",
        inp:"Request with JWT cookie", out:"Middleware check" },
      { id:"u2", layer:"middleware", title:"isLoggedIn Middleware",
        sub:"middleware/login.middleware.js",
        desc:"Extracts JWT from cookie, verifies signature, attaches user to req object.",
        code:"const token = req.cookies.jwt;\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\nreq.user = await User.findById(decoded.userId);\nnext();",
        inp:"Cookie 'jwt'", out:"req.user populated" },
      { id:"u3", layer:"backend",    title:"User Controller",
        sub:"controllers/user.controller.js",
        desc:"Fetches all users excluding the logged-in user from MongoDB.",
        code:"const users = await User.find(\n  { _id: { $ne: req.user._id } }\n).select('-password');\nres.json(users);",
        inp:"req.user._id", out:"Users array" },
      { id:"u4", layer:"frontend",   title:"Frontend Renders Users",
        sub:"components/UserList.jsx",
        desc:"Response stored in state. UI maps user data into card components.",
        code:"setUsers(data);\n// Users mapped to <UserCard /> components",
        inp:"HTTP 200 + users[]", out:"Rendered UI list" },
    ],
  },
};

const TECH = [
  { n:"Node.js",    r:"Runtime",          c:"#6ee7b7", g:"⬡" },
  { n:"Express.js", r:"Web Framework",    c:"#818cf8", g:"⟶" },
  { n:"MongoDB",    r:"Database",         c:"#a78bfa", g:"◈" },
  { n:"Mongoose",   r:"ODM",              c:"#c084fc", g:"◉" },
  { n:"React",      r:"UI Library",       c:"#38bdf8", g:"⬡" },
  { n:"Vite",       r:"Build Tool",       c:"#fbbf24", g:"⚡" },
  { n:"JWT",        r:"Auth Tokens",      c:"#f472b6", g:"🔑" },
  { n:"Bcryptjs",   r:"Password Hashing", c:"#fb923c", g:"⛨" },
];

/* ─── Animated connector between cards ─── */
function Arrow({ fromColor, toColor, show, idx }) {
  if (!show) return (
    <div style={{ height: 52, display: "flex", flexDirection: "column", alignItems: "center", opacity: 0 }}>
      <div style={{ width: 2, flex: 1, background: fromColor }} />
    </div>
  );
  return (
    <div style={{
      height: 52,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      opacity: show ? 1 : 0,
      transition: `opacity 0.4s ease ${idx * 0.1 + 0.15}s`,
    }}>
      {/* Top segment */}
      <div style={{
        width: 2, flex: 1,
        background: `linear-gradient(180deg, ${fromColor}cc 0%, ${toColor}cc 100%)`,
        borderRadius: 2,
      }} />
      {/* Travelling dot */}
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: toColor,
        boxShadow: `0 0 10px ${toColor}, 0 0 20px ${toColor}66`,
        flexShrink: 0,
        animation: `dotBounce 1.8s ease-in-out infinite`,
        animationDelay: `${idx * 0.25}s`,
      }} />
      {/* Bottom segment */}
      <div style={{
        width: 2, flex: 1,
        background: `${toColor}cc`,
        borderRadius: 2,
      }} />
      {/* Arrowhead */}
      <div style={{
        width: 0, height: 0,
        borderLeft: "7px solid transparent",
        borderRight: "7px solid transparent",
        borderTop: `10px solid ${toColor}`,
        filter: `drop-shadow(0 0 5px ${toColor})`,
        flexShrink: 0,
        animation: `arrowPop 1.8s ease-in-out infinite`,
        animationDelay: `${idx * 0.25}s`,
      }} />
    </div>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function Guiding() {
  const [activeFlow, setActiveFlow] = useState("signup");
  const [selected, setSelected] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [shown, setShown] = useState([]);

  const flow = FLOWS[activeFlow];

  useEffect(() => {
    setShown([]);
    setSelected(null);
    setAnimKey(k => k + 1);
    // Reveal ALL steps quickly so no card is missing
    flow.steps.forEach((_, i) => {
      setTimeout(() => setShown(prev => prev.includes(i) ? prev : [...prev, i]), i * 100 + 50);
    });
  }, [activeFlow]);

  return (
    <div style={S.root}>
      {/* Decorative orbs */}
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.orb3} />
      <div style={S.grid} />

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.headerBadge}>FULL-STACK ARCHITECTURE GUIDE</div>
        <h1 style={S.h1}>
          <span style={{ color: "#38bdf8" }}>Project </span>
          <span style={{ background: "linear-gradient(90deg,#818cf8,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Data Flow</span>
          <span> Guide</span>
        </h1>
        <p style={S.heroSub}>Node.js + Express · MongoDB · React + Vite · JWT Auth</p>
        <span style={S.serverBadge}>🟢 Backend · PORT 5000</span>
      </header>

      {/* ── TECH STRIP ── */}
      <div style={S.techStrip}>
        {TECH.map((t, i) => (
          <div key={i} style={{ ...S.techPill, borderColor: t.c + "60", animationDelay: `${i * 0.06}s` }}>
            <span style={{ fontSize: 17 }}>{t.g}</span>
            <div>
              <div style={{ color: t.c, fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{t.n}</div>
              <div style={{ color: "#475569", fontSize: 10 }}>{t.r}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={S.mainGrid}>

        {/* LEFT — FLOW PANEL */}
        <div style={S.flowPanel}>
          {/* Tabs */}
          <div style={S.tabs}>
            {Object.entries(FLOWS).map(([key, f]) => (
              <button key={key} onClick={() => setActiveFlow(key)} style={{
                ...S.tab,
                ...(activeFlow === key ? { borderColor: f.color, color: f.color, background: f.color + "18", fontWeight: 700 } : {}),
              }}>
                <span>{f.icon}</span><span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Steps + arrows */}
          <div key={animKey} style={S.stepsCol}>
            {flow.steps.map((step, idx) => {
              const meta = LAYER[step.layer];
              const isVis = shown.includes(idx);
              const isSel = selected?.id === step.id;
              const isLast = idx === flow.steps.length - 1;
              const nextMeta = !isLast ? LAYER[flow.steps[idx + 1].layer] : null;
              const nextVis = shown.includes(idx + 1);

              return (
                <div key={step.id} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Card */}
                  <div
                    onClick={() => setSelected(isSel ? null : step)}
                    style={{
                      ...S.card,
                      borderColor: isSel ? meta.color : meta.color + "50",
                      background: isSel ? meta.bg : "rgba(10,18,36,0.85)",
                      boxShadow: isSel
                        ? `0 0 30px ${meta.color}30, 0 6px 24px rgba(0,0,0,0.5), inset 0 0 0 1px ${meta.color}30`
                        : "0 4px 20px rgba(0,0,0,0.4)",
                      opacity: isVis ? 1 : 0,
                      transform: isVis ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
                      transition: `opacity 0.4s cubic-bezier(.4,0,.2,1) ${idx * 0.08}s,
                                   transform 0.4s cubic-bezier(.4,0,.2,1) ${idx * 0.08}s,
                                   border-color 0.2s, box-shadow 0.25s, background 0.2s`,
                    }}
                  >
                    {/* Card header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ ...S.iconBox, background: meta.color + "20", color: meta.color, borderColor: meta.color + "55" }}>
                        <span style={{ fontSize: 20 }}>{meta.g}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={S.cardTitle}>{step.title}</span>
                          <span style={{ ...S.tag, background: meta.color + "18", color: meta.color, borderColor: meta.color + "45" }}>
                            {meta.label}
                          </span>
                        </div>
                        <div style={S.cardSub}>{step.sub}</div>
                      </div>
                      <span style={{ color: meta.color, fontSize: 14, opacity: 0.7, flexShrink: 0 }}>
                        {isSel ? "▾" : "▸"}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={S.cardDesc}>{step.desc}</p>

                    {/* Expandable */}
                    <div style={{
                      overflow: "hidden",
                      maxHeight: isSel ? "500px" : "0px",
                      opacity: isSel ? 1 : 0,
                      marginTop: isSel ? 16 : 0,
                      transition: "max-height 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s ease, margin-top 0.3s",
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        {[["⤵ INPUT", "#6ee7b7", step.inp], ["⤴ OUTPUT", "#f472b6", step.out]].map(([label, col, val]) => (
                          <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "monospace", color: col, marginBottom: 5 }}>
                              {label}
                            </div>
                            <code style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "monospace" }}>{val}</code>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "monospace", color: "#475569", marginBottom: 8 }}>
                          📄 {step.sub}
                        </div>
                        <pre style={{ fontFamily: "monospace", fontSize: 12, color: "#a5f3fc", whiteSpace: "pre-wrap", lineHeight: 1.75, margin: 0 }}>
                          {step.code}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Arrow between cards — always rendered, shown when next card visible */}
                  {!isLast && (
                    <Arrow
                      fromColor={meta.color}
                      toColor={nextMeta.color}
                      show={isVis && nextVis}
                      idx={idx}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — SIDEBAR */}
        <div style={S.sidebar}>

          {/* Project Structure */}
          <div style={S.sCard}>
            <div style={S.sCardTitle}>
              <IconRoot />
              <span>Project Structure</span>
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
              {TREE.map((node, i) => (
                <div key={i} style={{ animation: `treeIn 0.3s ease both`, animationDelay: `${i * 0.02}s` }}>
                  <TreeRow node={node} rowIdx={i} />
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div style={S.sCard}>
            <div style={S.sCardTitle}>
              <span style={{ color: "#6ee7b7", fontSize: 16 }}>⟶</span>
              <span>API Endpoints</span>
            </div>
            {[
              { m: "POST", p: "/api/auth/signup", c: "#6ee7b7", d: "Register user" },
              { m: "POST", p: "/api/auth/login",  c: "#6ee7b7", d: "Authenticate" },
              { m: "POST", p: "/api/auth/logout", c: "#f87171", d: "Clear cookie" },
              { m: "GET",  p: "/api/users",       c: "#38bdf8", d: "Protected route", guard: true },
            ].map((ep, i) => (
              <div key={i} style={S.epRow}>
                <span style={{ ...S.method, background: ep.c + "18", color: ep.c }}>{ep.m}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "#e2e8f0" }}>{ep.p}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{ep.d}</div>
                </div>
                {ep.guard && <span style={S.guardTag}>🔒 JWT</span>}
              </div>
            ))}
          </div>


          {/* Auth note */}
          <div style={{ ...S.sCard, borderColor: "#f472b644" }}>
            <div style={S.sCardTitle}><span>🔑</span><span>Auth Mechanism</span></div>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.75, margin: 0 }}>
              JWT tokens signed with{" "}
              <code style={{ color: "#f472b6", background: "rgba(244,114,182,0.1)", padding: "1px 5px", borderRadius: 4 }}>JWT_SECRET</code>
              {" "}stored as{" "}<strong style={{ color: "#e2e8f0" }}>httpOnly cookies</strong>.
              {" "}The{" "}
              <code style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "1px 5px", borderRadius: 4 }}>isLoggedIn</code>
              {" "}middleware verifies every protected request automatically.
            </p>
          </div>
        </div>
      </div>

      {/* ── INFO CARDS ── */}
      <div style={S.infoGrid}>
        {[
          { g:"⬡", t:"Vite + React",      b:"Frontend built with Vite for near-instant HMR. React handles all UI state and component lifecycle.", c:"#38bdf8" },
          { g:"◉", t:"MongoDB Atlas",     b:"NoSQL document store. Mongoose ODM provides schema validation and rich query helpers.", c:"#a78bfa" },
          { g:"⛨", t:"Middleware Pipeline", b:"Express chain: body-parser → CORS → cookie-parser → route guards → controllers.", c:"#f59e0b" },
          { g:"◈", t:"MVC Pattern",       b:"Routes → Controllers → Models. Clean separation of concerns throughout the app.", c:"#818cf8" },
        ].map((card, i) => (
          <div key={i} style={{ ...S.infoCard, borderColor: card.c + "45", animationDelay: `${i * 0.09}s` }}>
            <div style={{ fontSize: 26, marginBottom: 10, color: card.c }}>{card.g}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{card.t}</div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{card.b}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={S.footer}>
        <span style={{ color: "#334155" }}>Built with </span>
        <span style={{ color: "#38bdf8" }}>Node.js + Express</span>
        <span style={{ color: "#334155" }}> · </span>
        <span style={{ color: "#818cf8" }}>React + Vite</span>
        <span style={{ color: "#334155" }}> · </span>
        <span style={{ color: "#a78bfa" }}>MongoDB</span>
      </footer>

      {/* ── GLOBAL CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@400;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080e1c; }

        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(18px,-28px) scale(1.05); }
        }
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes treeIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes dotBounce {
          0%,100% { transform:scale(0.7); opacity:0.4; }
          50%      { transform:scale(1.15); opacity:1; }
        }
        @keyframes arrowPop {
          0%,100% { opacity:0.5; transform:scaleY(0.9); }
          50%      { opacity:1; transform:scaleY(1.1); }
        }

        /* hover effects */
        [data-card]:hover { transform: translateY(1px) !important; }
        [data-tech]:hover { transform: translateY(-3px) !important; background: rgba(255,255,255,0.07) !important; }
        [data-info]:hover { transform: translateY(-5px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.45) !important; }
        [data-tab]:hover  { background: rgba(255,255,255,0.07) !important; color: #cbd5e1 !important; }
        [data-ep]:hover   { background: rgba(255,255,255,0.04); border-radius: 8px; }
        [data-trow]:hover span { color: #e2e8f0 !important; }

        @media (max-width: 900px) {
          .main-grid-resp { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .tech-strip-resp { gap: 8px !important; padding: 0 16px 40px !important; }
          .header-resp { padding: 50px 20px 36px !important; }
          .tabs-resp { gap: 6px !important; }
          .tab-resp { padding: 8px 12px !important; font-size: 12px !important; }
          .main-grid-resp { padding: 0 16px 40px !important; }
          .info-grid-resp { padding: 0 16px 40px !important; grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 420px) {
          .info-grid-resp { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */
const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #080e1c 0%, #0d1526 55%, #0f0a1e 100%)",
    color: "#e2e8f0",
    fontFamily: "'Syne', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  orb1: {
    position: "fixed", top: "-20%", left: "-10%", width: 650, height: 650,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 68%)",
    animation: "orbDrift 14s ease-in-out infinite",
    pointerEvents: "none", zIndex: 0,
  },
  orb2: {
    position: "fixed", top: "30%", right: "-15%", width: 550, height: 550,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(129,140,248,0.09) 0%, transparent 68%)",
    animation: "orbDrift 18s ease-in-out infinite reverse",
    pointerEvents: "none", zIndex: 0,
  },
  orb3: {
    position: "fixed", bottom: "-12%", left: "25%", width: 450, height: 450,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 68%)",
    animation: "orbDrift 12s ease-in-out infinite 4s",
    pointerEvents: "none", zIndex: 0,
  },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(56,189,248,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(56,189,248,0.025) 1px,transparent 1px)",
    backgroundSize: "60px 60px",
    pointerEvents: "none", zIndex: 0,
  },

  header: {
    textAlign: "center",
    padding: "80px 40px 48px",
    position: "relative", zIndex: 1,
    animation: "fadeDown 0.8s ease",
  },
  headerBadge: {
    display: "inline-block",
    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)",
    color: "#38bdf8", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em",
    padding: "5px 16px", borderRadius: 100, marginBottom: 22,
    fontFamily: "'JetBrains Mono', monospace",
  },
  h1: {
    fontSize: "clamp(30px, 5vw, 56px)", fontWeight: 800,
    lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em",
  },
  heroSub: {
    fontSize: 14, color: "#64748b",
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em", marginBottom: 18,
  },
  serverBadge: {
    display: "inline-block",
    background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.25)",
    color: "#6ee7b7", fontSize: 12, padding: "4px 14px", borderRadius: 100,
    fontFamily: "'JetBrains Mono', monospace",
  },

  techStrip: {
    display: "flex", flexWrap: "wrap", justifyContent: "center",
    gap: 10, padding: "0 40px 52px",
    position: "relative", zIndex: 1,
  },
  techPill: {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
    border: "1px solid", borderRadius: 12,
    animation: "fadeIn 0.6s ease both",
    transition: "transform 0.22s, background 0.22s",
    cursor: "default",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: 24,
    padding: "0 40px 52px",
    position: "relative", zIndex: 1,
    maxWidth: 1320, margin: "0 auto",
  },
  flowPanel: { display: "flex", flexDirection: "column", minWidth: 0 },

  tabs: { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" },
  tab: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#64748b", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Syne', sans-serif",
  },

  stepsCol: { display: "flex", flexDirection: "column" },

  card: {
    padding: "18px 20px", borderRadius: 14,
    border: "1px solid", backdropFilter: "blur(14px)",
    cursor: "pointer",
    transition: "transform 0.18s",
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, border: "1px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#e2e8f0" },
  tag: {
    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
    border: "1px solid", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em",
  },
  cardSub: { fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace", marginTop: 3 },
  cardDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginTop: 12 },

  sidebar: { display: "flex", flexDirection: "column", gap: 16 },
  sCard: {
    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "18px 16px",
    animation: "fadeIn 0.8s ease",
  },
  sCardTitle: {
    fontSize: 13, fontWeight: 700, color: "#e2e8f0",
    marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
  },
  epRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 4px", borderBottom: "1px solid rgba(255,255,255,0.05)",
    transition: "all 0.18s", cursor: "default",
  },
  method: {
    fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 6,
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em", flexShrink: 0,
  },
  guardTag: {
    marginLeft: "auto", fontSize: 10, color: "#f472b6",
    background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.25)",
    padding: "2px 7px", borderRadius: 6,
    fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
  },

  infoGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16, padding: "0 40px 52px",
    position: "relative", zIndex: 1,
    maxWidth: 1320, margin: "0 auto",
  },
  infoCard: {
    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)",
    border: "1px solid", borderRadius: 14, padding: "22px 20px",
    transition: "transform 0.28s, box-shadow 0.28s",
    animation: "fadeIn 1s ease both", cursor: "default",
  },

  footer: {
    textAlign: "center", padding: "24px", fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    position: "relative", zIndex: 1,
    color: "#e2e8f0",
  },
};