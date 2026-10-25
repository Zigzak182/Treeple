// Treeple clickable prototype. Everything is in-memory + localStorage;
// credential lookups are simulated. See ../DESIGN.md for the real design.

// Any verified credential from any of these issuers earns the Arborist flair.
const ISSUERS = {
  isa: {
    label: "ISA certification or TRAQ",
    numberLabel: "ISA certification number", placeholder: "e.g. PN-1234A",
    hint: "Find it on your ISA card or certificate, or in your ISA account.",
    lookup: "ISA's credential records",
  },
  tcia: {
    label: "TCIA Certified Treecare Safety Professional (CTSP)",
    numberLabel: "CTSP number", placeholder: "",
    hint: "Shown on your CTSP certificate.",
    lookup: "TCIA's CTSP records",
  },
  state: {
    label: "State or provincial arborist license",
    numberLabel: "License number", placeholder: "",
    hint: "As shown on your license or the state's public license lookup.",
    lookup: "the state's public license lookup",
  },
  other: {
    label: "Other tree-care credential",
    numberLabel: "Credential or membership number", placeholder: "",
    hint: "e.g. ASCA Registered Consulting Arborist, Arboricultural Association (UK), SAF Certified Forester.",
    lookup: "a moderator (manual review)",
  },
};

const CREDENTIALS = {
  certified_arborist: { label: "Certified Arborist", issuer: "isa" },
  utility: { label: "Utility Specialist", issuer: "isa" },
  municipal: { label: "Municipal Specialist", issuer: "isa" },
  tw_climber: { label: "Tree Worker Climber", issuer: "isa" },
  tw_aerial: { label: "Tree Worker Aerial Lift", issuer: "isa" },
  bcma: { label: "BCMA", issuer: "isa", gold: true },
  traq: { label: "TRAQ", issuer: "isa" },
  ctsp: { label: "CTSP", issuer: "tcia" },
  // State licenses and "other" credentials carry their own label.
  state_license: { label: "State license", issuer: "state" },
  other: { label: "Other credential", issuer: "other" },
};

const POST_TYPES = {
  ask: "Ask an Arborist",
  work: "Work share",
  tree_id: "Tree ID",
  risk: "Risk / Diagnosis",
  gear: "Gear",
  job: "Job",
};

// Question posts: anyone can ask, only verified arborists (and the asker) can reply.
const QUESTION_TYPES = new Set(["ask", "tree_id", "risk"]);

// Self-selected Root Flare for unverified accounts. "Arborist" flair can't be
// picked; it's earned by verifying any recognized tree-care credential.
const ROLES = {
  homeowner: { label: "Homeowner", icon: "🏠" },
  tree_worker: { label: "Tree Worker", icon: "🪢" },
};

// Loose on purpose: ISA formats vary by chapter, so never hard-reject on format.
const ISA_NUMBER_RE = /^[A-Z]{2}-\d{3,6}[A-Z]{0,4}$/;

const STORAGE_KEY = "treeple-prototype-v4";

function seed() {
  const users = {
    maria: {
      id: "maria", name: "Maria Okafor", avatar: "🧗‍♀️", company: "Canopy Works", companyId: "canopy",
      region: "Pacific Northwest", years: 12, role: "tree_worker",
      credentials: [
        { type: "certified_arborist", status: "verified", expires: "2027-08" },
        { type: "bcma", status: "verified", expires: "2027-08" },
        { type: "traq", status: "verified", expires: "2028-02" },
      ],
    },
    dev: {
      id: "dev", name: "Dev Patel", avatar: "🪚", company: "Patel Tree Service", companyId: "patel",
      region: "Southern", years: 6, role: "tree_worker",
      credentials: [
        { type: "certified_arborist", status: "expiring", expires: "2026-12" },
        { type: "tw_climber", status: "verified", expires: "2027-05" },
      ],
    },
    sam: {
      id: "sam", name: "Sam Reyes", avatar: "🌱", company: "Groundie @ Oak & Ash", companyId: "oakash",
      region: "Midwest", years: 1, role: "tree_worker", credentials: [],
    },
    linda: {
      id: "linda", name: "Linda Brooks", avatar: "🏡", company: "",
      region: "Northeast", years: 0, role: "homeowner", credentials: [],
    },
    me: {
      id: "me", name: "You", avatar: "🙂", company: "", region: "", years: 0,
      role: "homeowner", credentials: [],
    },
  };
  const posts = [
    {
      id: 4, author: "linda", type: "ask", photo: "🍁",
      body: "Our silver maple started leaning toward the house after last week's storm and there's a crack in the soil on the opposite side. Is this an emergency?",
      tags: ["#storm", "#leaning"], likes: 5, comments: [
        { author: "maria", body: "Soil heaving opposite a new lean means the root plate is failing. Keep people out of the fall zone and get a certified arborist out today. This is an emergency." },
        { author: "linda", body: "Thank you! Calling someone now." },
      ],
    },
    {
      id: 1, author: "maria", type: "work", photo: "🌲",
      body: "Crown reduction on a 90' Doug fir over a house. Went 15% max, all cuts to laterals at least 1/3 the parent diameter.",
      tags: ["#reduction", "#conifer"], likes: 42, comments: [
        { author: "sam", body: "How long did that take your crew?" },
        { author: "maria", body: "Two climbers, one day. Lots of rigging." },
      ],
    },
    {
      id: 2, author: "sam", type: "tree_id", photo: "🍂",
      body: "Opposite leaves, compound, 7 leaflets, diamond-pattern bark. Ash? Want to be sure before the EAB talk with the client.",
      tags: ["#treeid", "#EAB"], likes: 8, comments: [
        { author: "dev", body: "Opposite + compound + diamond bark = Fraxinus. Look for D-shaped exit holes and bark splits." },
      ],
    },
    {
      id: 3, author: "dev", type: "risk", photo: "🍄",
      body: "Ganoderma conks at the root flare of a red oak, ~40% of circumference. Client wants it saved. Thoughts on next steps?",
      tags: ["#decay", "#riskassessment"], likes: 19, comments: [
        { author: "maria", body: "Sonic tomography before anyone makes a call. With that much flare involvement I'd be planning for removal or a big target-zone change." },
      ],
    },
  ];
  // staff: user ids whose employment both the company and the person confirmed.
  const companies = {
    canopy: {
      id: "canopy", name: "Canopy Works", logo: "🌲", region: "Pacific Northwest",
      about: "Pruning, removals, and plant health care. Crane-assisted removals and storm response.",
      staff: ["maria"],
    },
    patel: {
      id: "patel", name: "Patel Tree Service", logo: "🪚", region: "Southern",
      about: "Family-owned residential tree care since 2015.",
      staff: ["dev"],
    },
    oakash: {
      id: "oakash", name: "Oak & Ash Tree Care", logo: "🌳", region: "Midwest",
      about: "Removals, stump grinding, and firewood.",
      staff: ["sam"],
    },
  };
  return { users, posts, companies, verification: null, nextPostId: 5 };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* storage blocked: fall back to fresh demo */ }
  return seed();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
}

let state = load();
let feedFilter = "all";
const emptyDraft = () => ({
  step: 1, issuer: "", name: "", number: "", creds: [], region: "", label: "", consent: false,
});
let verifyDraft = emptyDraft();

// ---------- helpers ----------

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function activeCreds(user) {
  return user.credentials.filter((c) => c.status === "verified" || c.status === "expiring");
}

function isVerified(user) {
  return activeCreds(user).length > 0;
}

function isBCMA(user) {
  return activeCreds(user).some((c) => c.type === "bcma");
}

function badge(user) {
  if (!isVerified(user)) return "";
  const gold = isBCMA(user);
  const title = gold ? "Verified — Board Certified Master Arborist" : "Verified credential";
  return `<span class="badge${gold ? " gold" : ""}" title="${title}">✓</span>`;
}

function flair(user) {
  if (isVerified(user)) {
    const gold = isBCMA(user);
    return `<span class="flair arborist${gold ? " gold" : ""}" title="Verified credential">✓ ${gold ? "Master Arborist" : "Arborist"}</span>`;
  }
  const r = ROLES[user.role] || ROLES.homeowner;
  return `<span class="flair">${r.icon} ${r.label}</span>`;
}

// A company is Certified only while at least one confirmed staff member is verified.
function certifiedStaff(company) {
  return company.staff.map((id) => state.users[id]).filter(isVerified);
}

function companyFlair(company) {
  return certifiedStaff(company).length
    ? `<span class="flair arborist" title="Has an ISA- or otherwise-credentialed arborist on staff">✓ Certified · Arborist on staff</span>`
    : `<span class="flair">No certified arborist on staff</span>`;
}

function canReply(user, post) {
  return !QUESTION_TYPES.has(post.type) || isVerified(user) || post.author === user.id;
}

function chips(user) {
  const cs = activeCreds(user);
  if (!cs.length) return "";
  return `<div class="chips">${cs.map((c) => {
    const def = CREDENTIALS[c.type];
    return `<span class="chip ${def.gold ? "gold" : ""}">${esc(c.label || def.label)}</span>`;
  }).join("")}</div>`;
}

function numberHint(issuer, number) {
  const ok = issuer !== "isa" || number === "" || ISA_NUMBER_RE.test(number);
  return ok
    ? `<span class="hint">${esc(ISSUERS[issuer].hint)}</span>`
    : `<span class="error">That doesn't look like a typical ISA number (e.g. PN-1234A). You can still continue — a moderator will check it.</span>`;
}

function detailsReady(d) {
  if (!d.name.trim() || !d.number.trim()) return false;
  if (d.issuer === "state") return d.region.trim() !== "" && d.label.trim() !== "";
  if (d.issuer === "other") return d.label.trim() !== "";
  return true;
}

function maskNumber(n) {
  return n.length <= 4 ? n : "•".repeat(n.length - 4) + n.slice(-4);
}

// ---------- views ----------

function viewFeed() {
  const me = state.users.me;
  const verified = isVerified(me);
  const defaultType = me.role === "homeowner" && !verified ? "ask" : "work";
  const filters = ["all", ...Object.keys(POST_TYPES)];
  const posts = state.posts.filter((p) => feedFilter === "all" || p.type === feedFilter);

  return `
    <div class="card">
      <textarea id="composer" placeholder="Share a job, ask for a Tree ID, review some gear…"></textarea>
      <div class="row">
        <select id="post-type">
          ${Object.entries(POST_TYPES).map(([k, v]) =>
            `<option value="${k}" ${k === "job" && !verified ? "disabled" : ""} ${k === defaultType ? "selected" : ""}>${v}${k === "job" && !verified ? " (Verified only)" : ""}</option>`
          ).join("")}
        </select>
        <button class="btn" id="post-btn">Post</button>
      </div>
      ${verified ? "" : me.role === "homeowner"
        ? `<p class="hint">Got a tree problem? Ask it here. Only verified arborists can answer.</p>`
        : `<p class="hint">Answering questions and posting jobs need a verified tree-care credential. <a href="#verify">Get verified →</a></p>`}
    </div>

    <div class="row" style="margin-bottom:12px">
      ${filters.map((f) => `<button class="btn ${f === feedFilter ? "" : "secondary"}" data-filter="${f}">${f === "all" ? "All" : POST_TYPES[f]}</button>`).join("")}
    </div>

    ${posts.length ? posts.map(viewPost).join("") : `<div class="card muted">No posts here yet.</div>`}
  `;
}

function viewPost(p) {
  const a = state.users[p.author];
  const me = state.users.me;
  const question = QUESTION_TYPES.has(p.type);
  return `
    <article class="card">
      <div class="post-head">
        <div class="avatar">${a.avatar}</div>
        <div>
          <div class="name">${esc(a.name)} ${flair(a)}</div>
          <div class="small muted">${a.companyId
            ? `<a href="#company/${a.companyId}">${esc(state.companies[a.companyId].name)}</a>`
            : esc(a.company || "")}${a.region ? " · " + esc(a.region) : ""}</div>
        </div>
        <span class="type-tag">${POST_TYPES[p.type]}</span>
      </div>
      <div>${esc(p.body)}</div>
      ${p.photo ? `<div class="photo">${p.photo}</div>` : ""}
      ${p.tags.length ? `<div class="tags">${p.tags.map(esc).join(" ")}</div>` : ""}
      ${p.type === "risk" ? `<p class="hint">Online advice isn't a site assessment. Get a qualified arborist on site.</p>` : ""}
      <div class="actions">
        <button data-like="${p.id}">🌿 ${p.likes}</button>
        <span>💬 ${p.comments.length}</span>
      </div>
      ${question ? `<p class="hint">🔒 Answers from verified arborists only.</p>` : ""}
      ${p.comments.map((c) => {
        const ca = state.users[c.author];
        return `<div class="comment">
          <span class="name">${esc(ca.name)} ${flair(ca)}</span>
          ${question && c.author === p.author ? `<span class="op">OP</span>` : ""}
          ${!isVerified(ca) && ca.role === "tree_worker" && c.author !== p.author
            ? `<span class="advice-only" title="This person hasn't verified a tree-care credential">Advice only · Not certified</span>` : ""}
          <div>${esc(c.body)}</div>
        </div>`;
      }).join("")}
      ${canReply(me, p) ? `
      <div class="row">
        <input type="text" placeholder="${question && p.author !== me.id ? "Answer as a verified arborist…" : "Add a comment…"}" data-comment-input="${p.id}">
        <button class="btn secondary" data-comment="${p.id}">Reply</button>
      </div>` : `
      <p class="hint">Only verified arborists can answer questions.
        ${me.role === "tree_worker" ? `<a href="#verify">Get verified →</a>` : ""}</p>`}
    </article>
  `;
}

function viewProfile() {
  const me = state.users.me;
  const v = state.verification;
  const myPosts = state.posts.filter((p) => p.author === "me");
  return `
    <div class="card">
      <div class="post-head">
        <div class="avatar lg">${me.avatar}</div>
        <div>
          <h1 class="name">${esc(me.name)}</h1>
          <div>${flair(me)}</div>
        </div>
      </div>
      ${chips(me)}
      ${isVerified(me)
        ? `<p class="hint">Your Arborist flair comes from your verified credentials.</p>`
        : `<label for="role">Your Root Flare</label>
           <select id="role">${Object.entries(ROLES).map(([k, r]) =>
             `<option value="${k}" ${me.role === k ? "selected" : ""}>${r.icon} ${r.label}</option>`).join("")}</select>
           <p class="hint">Arborist flair can't be picked. It's earned by verifying a tree-care credential (ISA, TRAQ, CTSP, state license, and more).</p>`}
      ${activeCreds(me).length ? `<ul class="small muted cred-list">${activeCreds(me).map((c) =>
        `<li>${esc(c.label || CREDENTIALS[c.type].label)} · ${esc(ISSUERS[CREDENTIALS[c.type].issuer].label)}
          ${c.number ? ` · # ${esc(maskNumber(c.number))}` : ""} · expires ${esc(c.expires)}</li>`).join("")}</ul>` : ""}
      ${me.credentials.some((c) => c.status === "expiring") ? `<div class="status expiring">A credential expires soon. Renew it with the issuer to keep your Arborist flair.</div>` : ""}
      ${v && v.status === "pending" ? `<div class="status pending">Verification pending — checking ${esc(ISSUERS[v.issuer].lookup)}.</div>` : ""}
      ${me.role === "tree_worker" || isVerified(me) ? `<p><a class="btn secondary" href="#verify" style="text-decoration:none">${isVerified(me) ? "Add another credential" : "Get verified"}</a></p>` : ""}
    </div>
    <div class="card">
      <h2>Your posts</h2>
      ${myPosts.length ? myPosts.map(viewPost).join("") : `<p class="muted">Nothing yet. <a href="#feed">Share something</a>.</p>`}
    </div>
  `;
}

function viewVerify() {
  const v = state.verification;
  const me = state.users.me;

  if (v && v.status === "pending") {
    return `
      <div class="card">
        <div class="status pending"><strong>Checking ${esc(ISSUERS[v.issuer].lookup)}…</strong><br>
          In the real app this is an issuer lookup or a moderator review (minutes to 1–3 days).</div>
        <p class="muted small">Submitted ${esc(v.name)} · ${esc(v.number)}</p>
      </div>`;
  }

  if (v && v.status === "verified") {
    return `
      <div class="card">
        <div class="status verified"><strong>You're verified ${badge(me)}</strong><br>
          Your flair is now ${flair(me)} and you can answer questions.</div>
        ${chips(me)}
        <p class="small muted">We re-check each credential with its issuer monthly and remind you 60, 30, and 7 days
          before it expires. If all your credentials lapse, the Arborist flair is hidden until you renew.</p>
        <div class="row">
          <a class="btn" href="#feed" style="text-decoration:none">Go to feed</a>
          <button class="btn secondary" id="add-another">Add another credential</button>
          <button class="btn secondary" id="simulate-expiring">Simulate: expiring soon</button>
        </div>
      </div>`;
  }

  if (v && v.status === "rejected") {
    return `
      <div class="card">
        <h2>We couldn't verify that credential</h2>
        <p class="muted">${esc(v.reason)}</p>
        <button class="btn" id="restart">Try again</button>
      </div>`;
  }

  const d = verifyDraft;
  const steps = `<div class="steps">${[1, 2, 3].map((i) => `<span class="${i <= d.step ? "on" : ""}"></span>`).join("")}</div>`;

  if (d.step === 1) {
    return `
      <div class="card">
        ${steps}
        <h1>${isVerified(me) ? "Add a credential" : "Get verified"}</h1>
        <p class="muted">Verify any recognized tree-care credential to earn the ✓ Arborist Root Flare and answer questions.</p>
        <label>What are you verifying?</label>
        ${Object.entries(ISSUERS).map(([k, iss]) => `
          <label class="check"><input type="radio" name="issuer" data-issuer="${k}" ${d.issuer === k ? "checked" : ""}>
            <span>${esc(iss.label)}</span></label>`).join("")}
        <div class="row"><button class="btn" id="v-next1" ${d.issuer ? "" : "disabled"}>Next</button></div>
      </div>`;
  }

  if (d.step === 2) {
    const iss = ISSUERS[d.issuer];
    const isaCreds = Object.entries(CREDENTIALS).filter(([, def]) => def.issuer === "isa");
    return `
      <div class="card">
        ${steps}
        <h2>${esc(iss.label)}</h2>
        <label for="v-name">Full name as it appears on the credential</label>
        <input type="text" id="v-name" value="${esc(d.name)}" placeholder="e.g. Maria J. Okafor">
        ${d.issuer === "state" ? `
          <label for="v-region">State or province</label>
          <input type="text" id="v-region" value="${esc(d.region)}" placeholder="e.g. New Jersey">
          <label for="v-label">License name</label>
          <input type="text" id="v-label" value="${esc(d.label)}" placeholder="e.g. Licensed Tree Expert">` : ""}
        ${d.issuer === "other" ? `
          <label for="v-label">Credential name and issuer</label>
          <input type="text" id="v-label" value="${esc(d.label)}" placeholder="e.g. ASCA Registered Consulting Arborist">` : ""}
        <label for="v-number">${esc(iss.numberLabel)}</label>
        <input type="text" id="v-number" value="${esc(d.number)}" placeholder="${esc(iss.placeholder)}" autocapitalize="characters">
        <p id="v-number-hint">${numberHint(d.issuer, d.number)}</p>
        ${d.issuer === "isa" ? `
          <label>Which ISA credentials do you hold?</label>
          ${isaCreds.map(([k, def]) => `
            <label class="check"><input type="checkbox" data-cred="${k}" ${d.creds.includes(k) ? "checked" : ""}>
              <span>${esc(def.label)}</span></label>`).join("")}` : ""}
        <label>Photo of your card or certificate (optional${d.issuer === "other" ? ", but speeds things up a lot" : ""})</label>
        <p class="hint">Used for manual review. Stored encrypted, deleted 30 days after a decision. (Not collected in this prototype.)</p>
        <div class="row">
          <button class="btn secondary" id="v-back">Back</button>
          <button class="btn" id="v-next2" ${detailsReady(d) && (d.issuer !== "isa" || d.creds.length) ? "" : "disabled"}>Next</button>
        </div>
      </div>`;
  }

  return `
    <div class="card">
      ${steps}
      <h2>Review &amp; submit</h2>
      <p><strong>${esc(d.name)}</strong><br><span class="muted">${esc(ISSUERS[d.issuer].label)} · ${esc(d.number)}</span></p>
      <div class="chips">${draftCredentials(d).map((c) =>
        `<span class="chip ${CREDENTIALS[c.type].gold ? "gold" : ""}">${esc(c.label || CREDENTIALS[c.type].label)}</span>`).join("")}</div>
      <label class="check"><input type="checkbox" id="v-consent" ${d.consent ? "checked" : ""}>
        <span>I authorize Treeple to check this credential with ${esc(ISSUERS[d.issuer].lookup)} and re-check it periodically. A credential number can be linked to one account.</span></label>
      <p class="hint">Demo tip: a number ending in <code>X</code> (e.g. <code>PN-1234X</code>) simulates a failed lookup.</p>
      <div class="row">
        <button class="btn secondary" id="v-back">Back</button>
        <button class="btn" id="v-submit" ${d.consent ? "" : "disabled"}>Submit for verification</button>
      </div>
    </div>`;
}

// The credentials a draft will add once verified.
function draftCredentials(d) {
  if (d.issuer === "isa") return d.creds.map((type) => ({ type }));
  if (d.issuer === "tcia") return [{ type: "ctsp" }];
  if (d.issuer === "state") return [{ type: "state_license", label: `${d.region.trim()} ${d.label.trim()}` }];
  return [{ type: "other", label: d.label.trim() }];
}

function viewCompany(id) {
  const co = state.companies[id];
  if (!co) return `<div class="card muted">Company not found.</div>`;
  const certified = certifiedStaff(co);
  const others = co.staff.map((sid) => state.users[sid]).filter((u) => !isVerified(u));
  return `
    <div class="card">
      <div class="post-head">
        <div class="avatar lg">${co.logo}</div>
        <div>
          <h1>${esc(co.name)}</h1>
          <div>${companyFlair(co)}</div>
          <div class="small muted">${esc(co.region)}</div>
        </div>
      </div>
      ${certified.length ? `
        <div class="staff-hero">
          <div class="staff-hero-title">Certified arborist${certified.length > 1 ? "s" : ""} on staff</div>
          ${certified.map((u) => `
            <div class="post-head">
              <div class="avatar">${u.avatar}</div>
              <div>
                <div class="name">${esc(u.name)} ${flair(u)}</div>
                ${chips(u)}
              </div>
            </div>`).join("")}
          <p class="hint">This company shows Certified because the people above hold verified credentials and confirmed they work here.</p>
        </div>` : `
        <div class="status expiring">No certified arborist is currently listed on staff. Advice and work from this company aren't backed by a verified credential.</div>`}
      <p>${esc(co.about)}</p>
      ${others.length ? `<h2>Other team members</h2>${others.map((u) =>
        `<div class="name">${esc(u.name)} ${flair(u)}</div>`).join("")}` : ""}
    </div>`;
}

// ---------- actions ----------

function submitVerification() {
  const d = verifyDraft;
  state.verification = {
    status: "pending", issuer: d.issuer, name: d.name.trim(), number: d.number.trim().toUpperCase(),
    creds: draftCredentials(d), submittedAt: Date.now(),
  };
  save();
  render();
  // Simulated issuer lookup / moderator review.
  setTimeout(() => {
    const v = state.verification;
    if (!v || v.status !== "pending") return;
    if (v.number.endsWith("X")) {
      v.status = "rejected";
      v.reason = `We couldn't find an active credential for that number and name in ${ISSUERS[v.issuer].lookup}. Check for typos, or if your name changed, submit a card photo for manual review.`;
    } else {
      v.status = "verified";
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 3);
      v.expires = exp.toISOString().slice(0, 7);
      state.users.me.name = v.name;
      const me = state.users.me;
      // Re-verifying a credential replaces it; new ones are added alongside.
      const fresh = v.creds.map((c) => ({ ...c, number: v.number, status: "verified", expires: v.expires }));
      me.credentials = [
        ...me.credentials.filter((old) => !fresh.some((c) => c.type === old.type && c.label === old.label)),
        ...fresh,
      ];
    }
    save();
    render();
  }, 2500);
}

function addPost() {
  const body = document.getElementById("composer").value.trim();
  const type = document.getElementById("post-type").value;
  if (!body) return;
  if (type === "job" && !isVerified(state.users.me)) return;
  const tags = body.match(/#\w+/g) || [];
  state.posts.unshift({ id: state.nextPostId++, author: "me", type, body, tags, likes: 0, comments: [], photo: "" });
  save();
  render();
}

// ---------- router / events ----------

function render() {
  const route = (location.hash || "#feed").slice(1);
  const app = document.getElementById("app");
  app.innerHTML = route.startsWith("company/") ? viewCompany(route.slice(8))
    : route === "profile" ? viewProfile() : route === "verify" ? viewVerify() : viewFeed();
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === route));
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.id === "post-btn") return addPost();
  if (t.dataset.filter) { feedFilter = t.dataset.filter; return render(); }
  if (t.dataset.like) {
    const p = state.posts.find((x) => x.id === +t.dataset.like);
    p.likes++; save(); return render();
  }
  if (t.dataset.comment) {
    const input = document.querySelector(`[data-comment-input="${t.dataset.comment}"]`);
    const body = input.value.trim();
    const post = state.posts.find((x) => x.id === +t.dataset.comment);
    if (!body || !canReply(state.users.me, post)) return;
    post.comments.push({ author: "me", body });
    save(); return render();
  }
  if (t.id === "v-next1") { verifyDraft.step = 2; return render(); }
  if (t.id === "v-next2") { verifyDraft.step = 3; return render(); }
  if (t.id === "v-back") { verifyDraft.step--; return render(); }
  if (t.id === "v-submit") return submitVerification();
  if (t.id === "restart" || t.id === "add-another") {
    state.verification = null; verifyDraft = emptyDraft();
    save(); return render();
  }
  if (t.id === "simulate-expiring") {
    state.users.me.credentials.forEach((c) => { c.status = "expiring"; });
    save(); location.hash = "#profile"; return render();
  }
  if (t.id === "reset") {
    state = seed(); verifyDraft = emptyDraft();
    save(); location.hash = "#feed"; return render();
  }
});

document.addEventListener("input", (e) => {
  const t = e.target;
  const d = verifyDraft;
  if (t.id === "v-name") d.name = t.value;
  else if (t.id === "v-number") d.number = t.value.toUpperCase();
  else if (t.id === "v-region") d.region = t.value;
  else if (t.id === "v-label") d.label = t.value;
  else return;
  // Update only the button state to keep focus in the field.
  const btn = document.getElementById("v-next2");
  if (btn) btn.disabled = !(detailsReady(d) && (d.issuer !== "isa" || d.creds.length));
});

document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.id === "v-number") {
    document.getElementById("v-number-hint").innerHTML = numberHint(verifyDraft.issuer, verifyDraft.number);
    return;
  }
  if (t.dataset.issuer) { verifyDraft.issuer = t.dataset.issuer; verifyDraft.creds = []; return render(); }
  if (t.dataset.cred) {
    const k = t.dataset.cred;
    verifyDraft.creds = t.checked ? [...verifyDraft.creds, k] : verifyDraft.creds.filter((c) => c !== k);
    return render();
  }
  if (t.id === "role") { state.users.me.role = t.value; save(); return render(); }
  if (t.id === "v-consent") { verifyDraft.consent = t.checked; return render(); }
});

window.addEventListener("hashchange", render);
render();
