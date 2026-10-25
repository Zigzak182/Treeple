# Treeple — Design

A social network for the tree-care industry: arborists, climbers, groundies,
plant health care techs, utility line clearance crews, municipal foresters,
consulting arborists, and students — plus the **homeowners** who need their
help.

The defining rules:
- **The "Arborist" Root Flare (Verified) means you hold at least one current,
  verified tree-care credential** — ISA certification, TRAQ, TCIA CTSP, a state
  arborist license, and others (§2). Nothing else (paying, follower count,
  company size) earns it.
- **Anyone can ask; only Verified arborists answer.** Questions are where bad
  advice does real damage, so answers are reserved for credentialed pros.
- **Uncertified tree workers can still give advice elsewhere, clearly
  labeled** "Advice only · Not certified".

---

## 1. Goals

1. Give tree-care professionals one place to share work, ask questions, find
   crews and jobs, and keep up with the trade.
2. Give homeowners a place to get trustworthy answers about their trees.
3. Make credentials legible. When someone answers "is this oak safe?", you
   should see at a glance whether they're an ISA Certified Arborist, a TRAQ
   holder, a state-licensed tree expert, or a Board Certified Master Arborist.
4. Keep verification trustworthy: flair expires when credentials lapse.

### Non-goals (v1)

- Marketplace payments / invoicing.
- "Hire an arborist" lead generation / quotes (possible v2 — homeowner
  questions are a natural funnel for it).
- Replacing issuers' own CEU / renewal tracking.

---

## 2. Users and Root Flare

Every account carries a **Root Flare** — a Reddit-style flair shown next to
the name on every post, comment, and profile, so you always know who you're
hearing from.

| Root Flare | Who | How they get it | What it unlocks |
|---|---|---|---|
| 🏠 **Homeowner** | Property owners, the tree-curious | Picked at sign-up | Read feed, ask questions, reply in their own question threads, comment on non-question posts, message |
| 🪢 **Tree Worker** | Climbers, groundies, PHC techs, students — in the trade but without a verified credential | Picked at sign-up | Everything Homeowner can do, plus open groups and the path to verification. Their comments carry an **Advice only · Not certified** label |
| ✓ **Arborist** (Verified) | Holds ≥1 current recognized credential (table below) | Verification flow (§4) — **cannot be self-selected** | Answer questions, credential chips, post jobs, Verified-only groups, Find an Arborist directory |
| ✓ **Master Arborist** (Verified, gold) | Current Board Certified Master Arborist | Verification flow | Same as Arborist |

Moderator is a separate role layered on top of a Verified account
(appointed; reviews flagged content and manual verifications).

Rules:
- Users switch freely between Homeowner and Tree Worker in settings.
- Arborist flair is applied automatically on verification and replaces the
  self-selected one. If **all** of a user's credentials lapse, the account
  falls back to its self-selected flair until one is renewed.
- Flair is a snapshot on each comment: an answer written while Verified stays
  marked "Arborist (at time of posting)" if the cert later lapses.

### Credentials recognized

**Any one current, verified credential earns the Arborist Root Flare.** Each
is shown as its own chip with its issuer; a person can hold several, and can
add more at any time.

| Credential | Chip | Notes |
|---|---|---|
| **ISA** | | |
| ISA Certified Arborist | `Certified Arborist` | Base credential; most common |
| Certified Arborist Utility Specialist | `Utility Specialist` | |
| Certified Arborist Municipal Specialist | `Municipal Specialist` | |
| Certified Tree Worker / Climber Specialist | `Tree Worker Climber` | |
| Certified Tree Worker / Aerial Lift Specialist | `Tree Worker Aerial Lift` | |
| Board Certified Master Arborist | `BCMA` | Top-tier; gets the gold Master Arborist flair |
| Tree Risk Assessment Qualification | `TRAQ` | A *qualification*, not a certification, but grants Verified on its own: ISA requires Certified Arborist status or equivalent education/experience to earn it. |
| **TCIA** | | |
| Certified Treecare Safety Professional | `CTSP` | |
| **Government** | | |
| State / provincial arborist or tree-expert license | e.g. `New Jersey Licensed Tree Expert` | Verified against the state's public license lookup. Chip names the state and license. |
| **Other** | | |
| Other tree-care credentials | as entered, e.g. `ASCA Registered Consulting Arborist` | e.g. ASCA RCA, Arboricultural Association (UK), SAF Certified Forester, Canadian provincial certs. Always manual review (path C). Moderators keep an allowlist of accepted credentials so repeat types get faster. |

Not accepted: general landscaping, pesticide applicator licenses on their
own, business licenses, insurance certificates — they don't show tree-care
expertise. Moderators can reject an "Other" submission on that basis.

---

## 3. Core features (v1)

### Questions: anyone asks, only Verified answers

Three post types are **questions**: *Ask an Arborist*, *Tree ID*, and
*Risk / Diagnosis*.

- Anyone (Homeowner, Tree Worker, Arborist) can post a question.
- **Only Verified arborists can answer.** Everyone else sees the thread
  read-only with "🔒 Answers from verified arborists only".
- **The asker (OP) can always reply in their own thread** — to add photos,
  answer follow-up questions ("which side is the lean?"), or say thanks. OP
  replies are tagged `OP`.
- Anyone can upvote ("🌿") answers; the asker can mark one as **Helpful**.
- Risk / Diagnosis threads carry a standing disclaimer that online advice
  isn't a site assessment, with a prompt to find a local certified arborist.
- Enforced server-side, not just hidden in the UI.

Non-question posts (work shares, gear) are open for anyone to comment on.

### "Advice only · Not certified"

Tree Workers know a lot and should be able to share it — but readers,
especially homeowners, need to tell it apart from credentialed advice.

- Every comment by a Tree Worker (unverified) carries an amber
  **Advice only · Not certified** label next to their flair.
- Not applied to a post's own author replying in their thread, or to
  Homeowners (their 🏠 flair already makes it clear they're not a pro).
- The label is snapshotted with the comment; if the author verifies later,
  old comments keep "Not certified (at time of posting)".

### Feed
- Posts: text, photos (up to 10), short video.
- Homeowners' composer defaults to *Ask an Arborist*; Tree Workers' and
  Arborists' defaults to *Work share*.
- Post types with their own UI:
  - **Ask an Arborist** — general homeowner question (question type).
  - **Work share** — before/after photos, species, technique tags (`#reduction`, `#cabling`, `#removal`, `#crane`).
  - **Tree ID** — "what is this?" with leaf/bark/form photos (question type).
  - **Risk / Diagnosis** — defects, decay, pests, disease (question type).
  - **Gear** — saws, rigging, ropes, PPE reviews.
  - **Job** — Verified-only posting (see §3, Jobs).
- Ranking: chronological from people/groups you follow, with a "Top in your region" tab.
  Verified arborists get an **Unanswered near you** tab of open questions.

### Profiles
- Name, photo, company, region, years in trade, specialties.
- **Credential block** (Verified only): each credential chip with its issuer,
  credential number (masked to last 4 by default; owner can choose to show in
  full), and *expiration month*. Tapping a chip links to the issuer's public
  lookup (ISA, state license board, etc.) where one exists, so anyone can
  double-check.
- Portfolio grid of work-share posts.

### Company pages

Companies can have a page (logo, about, region, services, photos, jobs).

**A company shows "✓ Certified · Arborist on staff" only while at least one
verified arborist is confirmed as working there — and that arborist must be
listed front and center.**

- **Staff link needs both sides to confirm**: a company admin adds the
  person, and the person accepts from their own account (or the person
  requests and the admin approves). A company can't claim someone who hasn't
  agreed.
- **Front and center**: directly under the company name and flair, before the
  "about" text or anything else, a highlighted **Certified arborist(s) on
  staff** panel shows each verified staff member's photo, name, Root Flare,
  and credential chips, linking to their profile. This panel can't be hidden,
  reordered below other content, or collapsed by the company.
- The same names appear wherever the company's Certified flair shows up in
  compact form (job posts, search results, directory): e.g. *"Certified ·
  Maria Okafor, BCMA"* or a tap-to-reveal list.
- **Status follows the person**: if every certified staff member leaves the
  company, unlinks, or lets their credentials lapse, the company loses
  Certified status immediately and the admin is notified. The page then says
  "No certified arborist currently listed on staff".
- An arborist can be linked to more than one company (e.g. a consultant), but
  each link is visible on their own profile so it's easy to spot abuse.
- Company pages don't answer questions; people do. Answers always come from
  individual accounts.

### Groups
- Open groups (e.g. *Climbers Corner*, *PHC & Soil*, *Crane Removals*).
- Verified-only groups (e.g. *Consulting Arborists*, *Expert Witness*).
- Regional groups tied to ISA chapters.

### Jobs
- Only Verified members (or companies with a Verified admin) can post.
- Fields: role, location, pay range (required), required credentials.
- Applicants can attach their Treeple profile.

### Messaging
- 1:1 and group DMs. Homeowners and Tree Workers can't cold-message Verified
  members more than N times/day (spam control) — questions should go to the
  public feed, where everyone benefits from the answer.

---

## 4. Verification flow

Each issuer (ISA, TCIA, state license boards, …) holds the authoritative
record for its credentials. We verify one credential at a time against its
issuer, and a user can add as many as they hold.

### 4.1 What the user submits
1. **Issuer**: ISA (certification or TRAQ), TCIA CTSP, state/provincial
   license, or Other.
2. Full name **as it appears on the credential**.
3. Credential number.
   - ISA numbers (e.g. `PN-1234A`, `WE-5678AT`) are a region/chapter prefix,
     a dash, digits, and credential-letter suffixes. We validate loosely
     (`^[A-Z]{2}-\d{3,6}[A-Z]{0,4}$`) and never reject purely on format.
   - Other issuers: free text.
4. Issuer-specific details: ISA → which ISA credentials (checkboxes); state →
   state/province and license name; Other → credential name and issuer.
5. Optional (strongly encouraged for Other): photo of the card or certificate.
6. Consent to look up the record and re-check it periodically.

### 4.2 How we verify (strongest first)

| Path | How | Speed | Notes |
|---|---|---|---|
| **A. Issuer partnership / data feed** | Query the issuer directly by number | Instant | Needs a data-sharing agreement. Pursue ISA first (biggest volume), then TCIA. |
| **B. Public lookup** | Check number + name against the issuer's public lookup (ISA's credential lookup, state license board search pages) | Minutes | Must respect each site's terms of use; do it manually or with permission, not by scraping. |
| **C. Manual review** | Moderator compares the submitted card photo with whatever record exists | 1–3 days | Always used for "Other"; fallback for name changes, international credentials, and issuers with no lookup. |

Name match uses normalized comparison (case, accents, middle initials,
common nicknames) and falls back to manual review on a mismatch rather than
auto-rejecting.

### 4.3 Status lifecycle

```
            submit                 lookup ok
  none ──────────────▶ pending ──────────────▶ verified
                         │                       │   │
                lookup   │                       │   │ 60 days before
                fails /  ▼                       │   ▼ expiry
                mismatch rejected ◀──────────────┘  expiring  (user nudged to renew CEUs)
                         ▲          revoked /          │
                         │          fraud              │ expiry passes
                         └─────────────────────────────┤
                                                       ▼
                                                     lapsed  (chip hidden, posts keep history)
```

- Each credential has its own expiration date from its issuer (ISA
  certifications renew every 3 years with CEUs; licenses vary by state). We
  re-check monthly, plus 60 / 30 / 7 days before expiry. Credentials without a
  published expiry get a yearly re-check.
- A lapsed credential's chip disappears. The Arborist flair stays as long as
  **any** credential is current. Old answers keep "Arborist (at time of
  posting)".
- Users can re-verify instantly once the issuer shows them as current again.

### 4.4 Anti-abuse
- One credential number (per issuer) ↔ one Treeple account. A second claim on
  the same number freezes both and goes to manual review.
- Report button on any flair ("I don't think this person is certified").
- Card photos are stored encrypted, accessible to moderators only, and
  deleted 30 days after a decision.

---

## 5. Data model (sketch)

```
User            id, name, handle, email, phone, region, company, bio, avatar_url,
                role (homeowner|tree_worker)   — self-selected Root Flare
                is_moderator, created_at

Credential      id, user_id, issuer (isa|tcia|state|other),
                type (certified_arborist|utility|municipal|tw_climber|
                tw_aerial|bcma|traq|ctsp|state_license|other),
                label (for state_license / other, e.g. "NJ Licensed Tree Expert"),
                jurisdiction (state/province, for state_license),
                number, status (pending|verified|expiring|lapsed|rejected|revoked),
                verified_via (issuer_api|public_lookup|manual), verified_at,
                expires_at, last_checked_at
                — unique (issuer, jurisdiction, number)

Verification    id, user_id, issuer, submitted_name, number, details (json),
Request         card_photo_key, status, reviewer_id, decision_note,
                created_at, decided_at

Post            id, author_id, type (work|tree_id|risk|gear|job), body,
                media[], tags[], group_id?, created_at
                — author_verified_snapshot: credentials at time of posting

Comment         id, post_id, author_id, body, author_flair_snapshot,
                advice_only (bool, snapshot), is_op, marked_helpful, created_at
Company         id, name, logo_url, about, region, admin_user_ids[], created_at
CompanyStaff    company_id, user_id, title, company_confirmed_at,
                user_confirmed_at, ended_at
                — counted only when both confirmed and not ended
Group           id, name, visibility (open|verified_only), chapter?
Job             id, post_id, company, location, pay_min, pay_max,
                required_credentials[]
Follow, Like, Message, Report — standard
```

"Verified" is derived, never stored: true while the user has at least one
Credential with status `verified` or `expiring` (any issuer, any type).
Displayed Root Flare = Master Arborist if verified with BCMA, else Arborist if
verified, else `User.role`.

Reply permission on a question post (`ask | tree_id | risk`):
`is_verified(user) OR post.author_id == user.id`.

Company is Certified while at least one active CompanyStaff row (both sides
confirmed, not ended) points to a verified user. Those users are the ones
listed in the company page's staff panel.

"Advice only" label on a comment:
`NOT is_verified(author) AND author.role == tree_worker AND author_id != post.author_id`.

---

## 6. Suggested stack

- **Mobile-first**: React Native (Expo) — most arborists live on their phone
  in the field.
- **Web**: Next.js sharing the same API.
- **API**: Node/TypeScript or Python, Postgres, S3-compatible storage for
  photos, a job queue for re-verification checks.
- **Search**: Postgres full-text to start; species/tag search later.

---

## 7. Roadmap

1. **Prototype** (this repo, `prototype/`) — clickable mock of feed, profile,
   and verification flow.
2. **MVP** — sign-up with Root Flare, profiles, feed, question posts with
   verified-only answers, advice-only labels, manual verification for all
   issuers (path C), flair with expiry.
3. **Trust** — reach out to ISA and TCIA about data partnerships (path A);
   public-lookup checks for ISA and the largest state license boards (path B);
   automated re-checks.
4. **Growth** — company pages, groups, jobs board, ISA chapter regions, Find
   an Arborist directory.

---

## 8. Open questions

1. ~~Does TRAQ alone grant Verified?~~ **Decided:** yes.
2. ~~Recognize non-ISA credentials?~~ **Decided:** yes — any recognized
   tree-care credential earns the Arborist flair.
3. ~~Should homeowners be able to join?~~ **Decided:** yes — they can ask,
   only Verified arborists answer, and Root Flare shows who's who.
4. ~~Can Tree Workers give advice?~~ **Decided:** yes, on non-question posts,
   labeled "Advice only · Not certified".
5. Should there be more self-selected flairs (e.g. Student, Municipal
   Forester, Landscaper), or keep it to Homeowner / Tree Worker?
6. Exactly which "Other" credentials are accepted? Needs a starting
   allowlist (ASCA RCA, Arboricultural Association, SAF CF, …).
7. ~~Company pages?~~ **Decided:** a company shows Certified while a verified
   arborist is on staff, and that arborist is listed front and center.
