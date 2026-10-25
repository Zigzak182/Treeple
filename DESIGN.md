# Treeple — Design

A social network for the tree-care industry: arborists, climbers, groundies,
plant health care techs, utility line clearance crews, municipal foresters,
consulting arborists, and students — plus the **homeowners** who need their
help.

The defining rules:
- **The "Arborist" Root Flare (Verified) means you hold a current ISA
  certification.** Nothing else (paying, follower count, company size) earns it.
- **Anyone can ask; only Verified arborists answer.** Questions are where bad
  advice does real damage, so answers are reserved for certified pros.

---

## 1. Goals

1. Give tree-care professionals one place to share work, ask questions, find
   crews and jobs, and keep up with the trade.
2. Give homeowners a place to get trustworthy answers about their trees.
3. Make credentials legible. When someone answers "is this oak safe?", you
   should see at a glance whether they're an ISA Certified Arborist, a TRAQ
   holder, or a Board Certified Master Arborist.
4. Keep verification trustworthy: badges expire when certifications lapse.

### Non-goals (v1)

- Marketplace payments / invoicing.
- "Hire an arborist" lead generation / quotes (possible v2 — homeowner
  questions are a natural funnel for it).
- Replacing ISA's own CEU tracking.

---

## 2. Users and Root Flare

Every account carries a **Root Flare** — a Reddit-style flair shown next to
the name on every post, comment, and profile, so you always know who you're
hearing from.

| Root Flare | Who | How they get it | What it unlocks |
|---|---|---|---|
| 🏠 **Homeowner** | Property owners, the tree-curious | Picked at sign-up | Read feed, ask questions, reply in their own question threads, comment on non-question posts, message |
| 🪢 **Tree Worker** | Climbers, groundies, PHC techs, students — in the trade but not ISA-certified | Picked at sign-up | Everything Homeowner can do, plus open groups and the path to verification |
| ✓ **Arborist** (Verified) | Holds ≥1 current ISA certification or TRAQ | ISA verification flow (§4) — **cannot be self-selected** | Answer questions, credential chips, post jobs, Verified-only groups, Find an Arborist directory |
| ✓ **Master Arborist** (Verified, gold) | Current Board Certified Master Arborist | ISA verification flow | Same as Arborist |

Moderator is a separate role layered on top of a Verified account
(appointed; reviews flagged content and manual verifications).

Rules:
- Users switch freely between Homeowner and Tree Worker in settings.
- Arborist flair is applied automatically on verification and replaces the
  self-selected one. If the certification lapses, the account falls back to
  its self-selected flair until it re-verifies.
- Flair is a snapshot on each comment: an answer written while Verified stays
  marked "Arborist (at time of posting)" if the cert later lapses.

### ISA credentials recognized

Each is shown as its own chip; a person can hold several.

| Credential | Chip | Notes |
|---|---|---|
| ISA Certified Arborist | `Certified Arborist` | Base credential; most common |
| Certified Arborist Utility Specialist | `Utility Specialist` | |
| Certified Arborist Municipal Specialist | `Municipal Specialist` | |
| Certified Tree Worker / Climber Specialist | `Tree Worker Climber` | |
| Certified Tree Worker / Aerial Lift Specialist | `Tree Worker Aerial Lift` | |
| Board Certified Master Arborist | `BCMA` | Top-tier; gets a gold badge variant |
| Tree Risk Assessment Qualification | `TRAQ` | A *qualification*, not a certification, but **does** grant Verified on its own: ISA requires Certified Arborist status or equivalent education/experience to earn it. Renews on a 5-year cycle. |

Any one current credential from this table earns Verified and the Arborist
Root Flare.

---

## 3. Core features (v1)

### Questions: anyone asks, only Verified answers

Three post types are **questions**: *Ask an Arborist*, *Tree ID*, and
*Risk / Diagnosis*.

- Anyone (Homeowner, Tree Worker, Arborist) can post a question.
- **Only Verified arborists can answer.** Everyone else sees the thread
  read-only with "🔒 Answers from ISA-verified arborists only".
- **The asker (OP) can always reply in their own thread** — to add photos,
  answer follow-up questions ("which side is the lean?"), or say thanks. OP
  replies are tagged `OP`.
- Anyone can upvote ("🌿") answers; the asker can mark one as **Helpful**.
- Risk / Diagnosis threads carry a standing disclaimer that online advice
  isn't a site assessment, with a prompt to find a local certified arborist.
- Enforced server-side, not just hidden in the UI.

Non-question posts (work shares, gear) are open for anyone to comment on.

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
- **Credential block** (Verified only): each credential chip, ISA cert number
  (masked to last 4 by default; owner can choose to show in full), and
  *expiration month*. Tapping a chip links to ISA's public credential lookup
  so anyone can double-check.
- Portfolio grid of work-share posts.

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

## 4. ISA verification flow

ISA maintains the authoritative record of who is certified. As of this
writing ISA offers a public credential lookup on its website but no public
API that we've confirmed, so the design supports three verification paths and
picks the strongest one available.

### 4.1 What the user submits
1. Full name **as it appears on their ISA record**.
2. ISA certification number (e.g. `PN-1234A`, `WE-5678AT`). Format is a
   region/chapter prefix, a dash, digits, and credential-letter suffixes. We
   validate loosely (`^[A-Z]{2}-\d{3,6}[A-Z]{0,4}$`) and never reject a number
   purely on format — ISA formats vary and change.
3. Which credentials they hold (checkboxes).
4. Optional: photo of their ISA card or certificate.
5. Consent to look up their record and re-check it periodically.

### 4.2 How we verify (strongest first)

| Path | How | Speed | Notes |
|---|---|---|---|
| **A. ISA partnership / data feed** | Query ISA directly by cert number | Instant | Requires a data-sharing agreement with ISA. Pursue early — this is the best path. |
| **B. Public credential lookup** | Check the cert number + name against ISA's public "Verify a Credential" page | Minutes | Must respect ISA's terms of use; do it manually or with permission, not by scraping. |
| **C. Manual review** | Moderator compares submitted card photo with the lookup | 1–3 days | Fallback for edge cases (name changes, international chapters). |

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
                                                     lapsed  (badge hidden, posts keep history)
```

- ISA certifications renew on a **3-year cycle** with CEU requirements. We
  store the expiration date and re-check monthly, plus 60 / 30 / 7 days before
  expiry.
- When a credential lapses, the badge disappears from the profile and new
  posts. Old "Certified answer" labels stay but show "at time of posting".
- Users can re-verify instantly once ISA shows them as current again.

### 4.4 Anti-abuse
- One ISA number ↔ one Treeple account. A second claim on the same number
  freezes both and goes to manual review.
- Report button on any badge ("I don't think this person is certified").
- Card photos are stored encrypted, accessible to moderators only, and
  deleted 30 days after a decision.

---

## 5. Data model (sketch)

```
User            id, name, handle, email, phone, region, company, bio, avatar_url,
                role (homeowner|tree_worker)   — self-selected Root Flare
                is_moderator, created_at

Credential      id, user_id, type (certified_arborist|utility|municipal|
                tw_climber|tw_aerial|bcma|traq), isa_number, status
                (pending|verified|expiring|lapsed|rejected|revoked),
                verified_via (isa_api|public_lookup|manual), verified_at,
                expires_at, last_checked_at

Verification    id, user_id, submitted_name, isa_number, card_photo_key,
Request         status, reviewer_id, decision_note, created_at, decided_at

Post            id, author_id, type (work|tree_id|risk|gear|job), body,
                media[], tags[], group_id?, created_at
                — author_verified_snapshot: credentials at time of posting

Comment         id, post_id, author_id, body, author_flair_snapshot, is_op,
                marked_helpful, created_at
Group           id, name, visibility (open|verified_only), chapter?
Job             id, post_id, company, location, pay_min, pay_max,
                required_credentials[]
Follow, Like, Message, Report — standard
```

"Verified" is derived, never stored: true while the user has at least one
Credential with status `verified` or `expiring` (any type, including `traq`).
Displayed Root Flare = Master Arborist if verified with BCMA, else Arborist if
verified, else `User.role`.

Reply permission on a question post (`ask | tree_id | risk`):
`is_verified(user) OR post.author_id == user.id`.

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
   verified-only answers, manual ISA verification (path C), flair with expiry.
3. **Trust** — reach out to ISA about a data partnership (path A); automated
   re-checks.
4. **Growth** — groups, jobs board, ISA chapter regions, Find an Arborist
   directory.

---

## 8. Open questions

1. ~~Does TRAQ alone grant Verified?~~ **Decided:** yes.
2. Recognize non-ISA credentials (e.g. state licenses, UK Arboricultural
   Association, TCIA CTSP) as secondary chips without the Verified badge?
3. ~~Should homeowners be able to join?~~ **Decided:** yes — they can ask,
   only Verified arborists answer, and Root Flare shows who's who.
4. Can Tree Workers comment on work shares with advice that reads like an
   answer? (Current answer: yes; only question types are locked.)
5. Should there be more self-selected flairs (e.g. Student, Municipal
   Forester, Landscaper), or keep it to Homeowner / Tree Worker?
6. Company pages: does a company get verified if it employs a Certified
   Arborist?
