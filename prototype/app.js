// Treeple clickable prototype. Everything is in-memory + localStorage;
// the ISA lookup is simulated. See ../DESIGN.md for the real design.

const CREDENTIALS = {
  certified_arborist: { label: "Certified Arborist" },
  utility: { label: "Utility Specialist" },
  municipal: { label: "Municipal Specialist" },
  tw_climber: { label: "Tree Worker Climber" },
  tw_aerial: { label: "Tree Worker Aerial Lift" },
  bcma: { label: "BCMA", gold: true },
  // TRAQ is a qualification, not a certification: shown, but doesn't verify.
  traq: { label: "TRAQ", grantsVerified: false },
};

const POST_TYPES = {
  work: "Work share",
  tree_id: "Tree ID",
  risk: "Risk / Diagnosis",
  gear: "Gear",
  job: "Job",
};

// Loose on purpose: ISA formats vary by chapter, so never hard-reject on format.
const ISA_NUMBER_RE = /^[A-Z]{2}-\d{3,6}[A-Z]{0,4}$/;

const STORAGE_KEY = "treeple-prototype-v1";

function seed() {
  const users = {
    maria: {
      id: "maria", name: "Maria Okafor", avatar: "🧗‍♀️", company: "Canopy Works",
      region: "Pacific Northwest", years: 12,
      credentials: [
        { type: "certified_arborist", status: "verified", expires: "2027-08" },
        { type: "bcma", status: "verified", expires: "2027-08" },
        { type: "traq", status: "verified", expires: "2028-02" },
      ],
    },
    dev: {
      id: "dev", name: "Dev Patel", avatar: "🪚", company: "Patel Tree Service",
      region: "Southern", years: 6,
      credentials: [
        { type: "certified_arborist", status: "expiring", expires: "2026-12" },
        { type: "tw_climber", status: "verified", expires: "2027-05" },
      ],
    },
    sam: {
      id: "sam", name: "Sam Reyes", avatar: "🌱", company: "Groundie @ Oak & Ash",
      region: "Midwest", years: 1, credentials: [],
    },
    me: {
      id: "me", name: "You", avatar: "🙂", company: "", region: "", years: 0,
      credentials: [],
    },
  };
  const posts = [
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
  return { users, posts, verification: null, nextPostId: 4 };
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
let verifyDraft = { step: 1, name: "", number: "", creds: [], consent: false };

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
  return activeCreds(user).some((c) => CREDENTIALS[c.type].grantsVerified !== false);
}

function isBCMA(user) {
  return activeCreds(user).some((c) => c.type === "bcma");
}

function badge(user) {
  if (!isVerified(user)) return "";
  const gold = isBCMA(user);
  const title = gold ? "Verified — Board Certified Master Arborist" : "Verified — ISA Certified";
  return `<span class="badge${gold ? " gold" : ""}" title="${title}">✓</span>`;
}

function chips(user) {
  const cs = activeCreds(user);
  if (!cs.length) return "";
  return `<div class="chips">${cs.map((c) => {
    const def = CREDENTIALS[c.type];
    const cls = def.gold ? "gold" : def.grantsVerified === false ? "plain" : "";
    return `<span class="chip ${cls}">${esc(def.label)}</span>`;
  }).join("")}</div>`;
}

function numberHint(ok) {
  return ok
    ? `<span class="hint">Find it on your ISA card or certificate, or in your ISA account.</span>`
    : `<span class="error">That doesn't look like a typical ISA number (e.g. PN-1234A). You can still continue — a moderator will check it.</span>`;
}

function maskNumber(n) {
  return n.length <= 4 ? n : "•".repeat(n.length - 4) + n.slice(-4);
}

// ---------- views ----------

function viewFeed() {
  const me = state.users.me;
  const verified = isVerified(me);
  const filters = ["all", ...Object.keys(POST_TYPES)];
  const posts = state.posts.filter((p) => feedFilter === "all" || p.type === feedFilter);

  return `
    <div class="card">
      <textarea id="composer" placeholder="Share a job, ask for a Tree ID, review some gear…"></textarea>
      <div class="row">
        <select id="post-type">
          ${Object.entries(POST_TYPES).map(([k, v]) =>
            `<option value="${k}" ${k === "job" && !verified ? "disabled" : ""}>${v}${k === "job" && !verified ? " (Verified only)" : ""}</option>`
          ).join("")}
        </select>
        <button class="btn" id="post-btn">Post</button>
      </div>
      ${verified ? "" : `<p class="hint">Posting jobs and the Certified answer label need an ISA certification. <a href="#verify">Get verified →</a></p>`}
    </div>

    <div class="row" style="margin-bottom:12px">
      ${filters.map((f) => `<button class="btn ${f === feedFilter ? "" : "secondary"}" data-filter="${f}">${f === "all" ? "All" : POST_TYPES[f]}</button>`).join("")}
    </div>

    ${posts.length ? posts.map(viewPost).join("") : `<div class="card muted">No posts here yet.</div>`}
  `;
}

function viewPost(p) {
  const a = state.users[p.author];
  const showCertLabel = p.type === "tree_id" || p.type === "risk";
  return `
    <article class="card">
      <div class="post-head">
        <div class="avatar">${a.avatar}</div>
        <div>
          <div class="name">${esc(a.name)} ${badge(a)}</div>
          <div class="small muted">${esc(a.company || "")}${a.region ? " · " + esc(a.region) : ""}</div>
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
      ${p.comments.map((c) => {
        const ca = state.users[c.author];
        const certified = showCertLabel && isVerified(ca);
        return `<div class="comment">
          <span class="name">${esc(ca.name)} ${badge(ca)}</span>
          ${certified ? `<span class="certified-answer">Certified answer</span>` : ""}
          <div>${esc(c.body)}</div>
        </div>`;
      }).join("")}
      <div class="row">
        <input type="text" placeholder="Add a comment…" data-comment-input="${p.id}">
        <button class="btn secondary" data-comment="${p.id}">Reply</button>
      </div>
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
          <h1 class="name">${esc(me.name)} ${badge(me)}</h1>
          <div class="muted">${isVerified(me) ? "ISA Verified" : "Member"}</div>
        </div>
      </div>
      ${chips(me)}
      ${isVerified(me) && v ? `
        <p class="small muted">ISA # ${esc(maskNumber(v.number))} · expires ${esc(v.expires)} ·
          <a href="https://www.isa-arbor.com" target="_blank" rel="noopener">verify on ISA</a></p>` : ""}
      ${me.credentials.some((c) => c.status === "expiring") ? `<div class="status expiring">Your ISA certification expires soon. Finish your CEUs and renew with ISA to keep your badge.</div>` : ""}
      ${v && v.status === "pending" ? `<div class="status pending">Verification pending — checking your ISA record.</div>` : ""}
      ${!v ? `<p><a class="btn" href="#verify" style="text-decoration:none">Get verified with your ISA certification</a></p>` : ""}
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
        <div class="status pending"><strong>Checking your ISA record…</strong><br>
          In the real app this is an ISA lookup or a moderator review (minutes to 1–3 days).</div>
        <p class="muted small">Submitted ${esc(v.name)} · ${esc(v.number)}</p>
      </div>`;
  }

  if (v && v.status === "verified") {
    return `
      <div class="card">
        <div class="status verified"><strong>You're verified ${badge(me)}</strong><br>
          Your badge shows on your profile, posts, and comments.</div>
        ${chips(me)}
        <p class="small muted">We re-check your ISA record monthly and remind you 60, 30, and 7 days
          before your certification expires (${esc(v.expires)}). If it lapses, the badge is hidden until you renew.</p>
        <div class="row">
          <a class="btn" href="#feed" style="text-decoration:none">Go to feed</a>
          <button class="btn secondary" id="simulate-expiring">Simulate: expiring soon</button>
        </div>
      </div>`;
  }

  if (v && v.status === "rejected") {
    return `
      <div class="card">
        <h2>We couldn't verify that number</h2>
        <p class="muted">${esc(v.reason)}</p>
        <button class="btn" id="restart">Try again</button>
      </div>`;
  }

  const d = verifyDraft;
  const steps = `<div class="steps">${[1, 2, 3].map((i) => `<span class="${i <= d.step ? "on" : ""}"></span>`).join("")}</div>`;

  if (d.step === 1) {
    const numOk = d.number === "" || ISA_NUMBER_RE.test(d.number);
    return `
      <div class="card">
        ${steps}
        <h1>Get verified</h1>
        <p class="muted">The Verified badge on Treeple means one thing: you hold a current ISA certification.</p>
        <label for="v-name">Full name as it appears on your ISA record</label>
        <input type="text" id="v-name" value="${esc(d.name)}" placeholder="e.g. Maria J. Okafor">
        <label for="v-number">ISA certification number</label>
        <input type="text" id="v-number" value="${esc(d.number)}" placeholder="e.g. PN-1234A" autocapitalize="characters">
        <p id="v-number-hint">${numberHint(numOk)}</p>
        <div class="row"><button class="btn" id="v-next1" ${d.name.trim() && d.number.trim() ? "" : "disabled"}>Next</button></div>
      </div>`;
  }

  if (d.step === 2) {
    return `
      <div class="card">
        ${steps}
        <h2>Which credentials do you hold?</h2>
        ${Object.entries(CREDENTIALS).map(([k, def]) => `
          <label class="check"><input type="checkbox" data-cred="${k}" ${d.creds.includes(k) ? "checked" : ""}>
            <span>${esc(def.label)}${def.grantsVerified === false ? ` <span class="muted small">— shown on your profile, but doesn't verify on its own</span>` : ""}</span>
          </label>`).join("")}
        <label>Photo of your ISA card (optional)</label>
        <p class="hint">Speeds up manual review. Stored encrypted, deleted 30 days after a decision. (Not collected in this prototype.)</p>
        <div class="row">
          <button class="btn secondary" id="v-back">Back</button>
          <button class="btn" id="v-next2" ${d.creds.some((c) => CREDENTIALS[c].grantsVerified !== false) ? "" : "disabled"}>Next</button>
        </div>
        ${d.creds.length && !d.creds.some((c) => CREDENTIALS[c].grantsVerified !== false)
          ? `<p class="error">Pick at least one ISA certification (TRAQ alone doesn't qualify).</p>` : ""}
      </div>`;
  }

  return `
    <div class="card">
      ${steps}
      <h2>Review &amp; submit</h2>
      <p><strong>${esc(d.name)}</strong><br><span class="muted">${esc(d.number)}</span></p>
      <div class="chips">${d.creds.map((c) => `<span class="chip ${CREDENTIALS[c].gold ? "gold" : ""}">${esc(CREDENTIALS[c].label)}</span>`).join("")}</div>
      <label class="check"><input type="checkbox" id="v-consent" ${d.consent ? "checked" : ""}>
        <span>I authorize Treeple to look up my ISA credential record and re-check it periodically. One ISA number can be linked to one account.</span></label>
      <p class="hint">Demo tip: a number ending in <code>X</code> (e.g. <code>PN-1234X</code>) simulates a failed lookup.</p>
      <div class="row">
        <button class="btn secondary" id="v-back">Back</button>
        <button class="btn" id="v-submit" ${d.consent ? "" : "disabled"}>Submit for verification</button>
      </div>
    </div>`;
}

// ---------- actions ----------

function submitVerification() {
  const d = verifyDraft;
  state.verification = {
    status: "pending", name: d.name.trim(), number: d.number.trim().toUpperCase(),
    creds: [...d.creds], submittedAt: Date.now(),
  };
  save();
  render();
  // Simulated ISA lookup.
  setTimeout(() => {
    const v = state.verification;
    if (!v || v.status !== "pending") return;
    if (v.number.endsWith("X")) {
      v.status = "rejected";
      v.reason = "ISA's records didn't show an active certification for that number and name. Check for typos, or if your name changed, submit a card photo for manual review.";
    } else {
      v.status = "verified";
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 3);
      v.expires = exp.toISOString().slice(0, 7);
      state.users.me.name = v.name;
      state.users.me.credentials = v.creds.map((type) => ({ type, status: "verified", expires: v.expires }));
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
  app.innerHTML = route === "profile" ? viewProfile() : route === "verify" ? viewVerify() : viewFeed();
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
    if (!body) return;
    state.posts.find((x) => x.id === +t.dataset.comment).comments.push({ author: "me", body });
    save(); return render();
  }
  if (t.id === "v-next1") { verifyDraft.step = 2; return render(); }
  if (t.id === "v-next2") { verifyDraft.step = 3; return render(); }
  if (t.id === "v-back") { verifyDraft.step--; return render(); }
  if (t.id === "v-submit") return submitVerification();
  if (t.id === "restart") {
    state.verification = null; verifyDraft = { step: 1, name: "", number: "", creds: [], consent: false };
    save(); return render();
  }
  if (t.id === "simulate-expiring") {
    state.users.me.credentials.forEach((c) => { c.status = "expiring"; });
    save(); location.hash = "#profile"; return render();
  }
  if (t.id === "reset") {
    state = seed(); verifyDraft = { step: 1, name: "", number: "", creds: [], consent: false };
    save(); location.hash = "#feed"; return render();
  }
});

document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.id === "v-name") verifyDraft.name = t.value;
  else if (t.id === "v-number") verifyDraft.number = t.value.toUpperCase();
  else return;
  // Re-render only the button state to keep focus in the field.
  const btn = document.getElementById("v-next1");
  if (btn) btn.disabled = !(verifyDraft.name.trim() && verifyDraft.number.trim());
});

document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.id === "v-number") {
    const ok = verifyDraft.number === "" || ISA_NUMBER_RE.test(verifyDraft.number);
    document.getElementById("v-number-hint").innerHTML = numberHint(ok);
    return;
  }
  if (t.dataset.cred) {
    const k = t.dataset.cred;
    verifyDraft.creds = t.checked ? [...verifyDraft.creds, k] : verifyDraft.creds.filter((c) => c !== k);
    return render();
  }
  if (t.id === "v-consent") { verifyDraft.consent = t.checked; return render(); }
});

window.addEventListener("hashchange", render);
render();
