# Project handoff — financial-product-shop

Context for whoever (or whichever Claude instance) picks this up next. This covers
work done in a prior session that isn't visible from the repo files alone — design
decisions, gotchas, and what's still unfinished.

## What this app is
A React + Vite SPA for an insurance/financial-product shop. Frontend talks to a
separate legacy backend (Docker, port 8080 locally) for accounts/products/KYC, and
to Firebase for auth, storage, analytics, and (new) a credential-vault Cloud Functions
setup. Tailwind for styling, React Router for routes, no state library — just
Context (`AuthContext`, `ThemeContext`) + local component state.

## Architecture decisions worth knowing
- **Legacy backend is immutable.** Hard constraint from the project owner: the
  existing backend DB schema/behavior (`/v1/token` Basic-auth login, `/v1/user`,
  `/client/v1/profile`, etc. — see `src/services/authService.js`,
  `customerService.js`) must never change. All new identity work (Google sign-in,
  password changes) has to be bolted on around it, not change it.
- **Firebase is the new identity front door; legacy backend is now an internal
  "service account."** This is why a credential-vault pattern exists (see below) —
  it's how Google sign-in works without ever changing the legacy DB.
- **`react-hooks/set-state-in-effect` ESLint rule is enabled and enforced as a
  build-blocker** in this project's tooling. Several pages had `setState` called
  synchronously in a `useEffect` body — this is now a real lint error that blocks
  dev/build, not just a warning. Fix pattern used throughout: wrap the synchronous
  branch in `queueMicrotask(() => setX(...))`. See `SignUpPage.jsx`, `AccountPage.jsx`,
  `ProductsPage.jsx` for the pattern if it recurs elsewhere.
- **Mobile-first, now partially responsive.** Most of the app originally had zero
  responsive breakpoints (hardcoded `max-w-[411px]` everywhere, assuming an iPhone
  frame). A pass added `md:`/`lg:` breakpoints across `Header.jsx` (new desktop top
  nav merged in here, `BottomNav.jsx` is `md:hidden` since Header covers desktop),
  page containers (`max-w-[411px] md:max-w-5xl` pattern), the KYC bottom sheet
  (mobile sheet → desktop centered modal), and `DiscoverSection.jsx`'s product grid
  (2/3/4 cols by breakpoint). `HeroSlider.jsx`/`SectionRow.jsx` were deliberately
  left as horizontal-scroll carousels on desktop too — that's an intentional pattern
  choice, not an oversight.

## The credential vault (Google sign-in bolted onto the legacy backend)
This is the newest and most architecturally significant piece. Problem: the legacy
backend only does username+password login; Firebase Google sign-in doesn't produce
a password. Solution implemented:

- **`functions/index.js`** — two Cloud Functions (Firebase Functions v2, `onCall`):
  - `vaultLegacyCredentials({ legacyUsername, legacyPassword })` — called once,
    right after a Google sign-up creates a legacy account with a randomly generated
    password. Encrypts the password (AES-256-GCM, key from the `LEGACY_VAULT_KEY`
    secret) and writes it to Firestore (`credentialVault/{firebaseUid}`). Write-once:
    no-ops if a doc already exists for that UID. **Never** overwrites.
  - `legacyLogin()` — called on subsequent Google sign-ins. Looks up the vault doc
    by the caller's Firebase UID, decrypts the password server-side, replays the
    login against the legacy `/v1/token` endpoint, and returns `{ token, customerId }`.
    The plaintext legacy password **never reaches the browser**, even at login time.
- **`firestore.rules`** — denies ALL client read/write on `credentialVault/*`. Only
  the Admin SDK (inside Cloud Functions) can touch it; rules don't apply to Admin SDK
  calls, so this is a real hard block, not just an honor system.
- **Client wiring**: `src/services/credentialVault.js` wraps both callables.
  `SignUpPage.jsx`'s `handleGoogleSignUp` creates the legacy account + vaults it
  (only on fresh creation, never on the "account already existed" 400 branch — vaulting
  a guessed password there would corrupt the vault). `LoginPage.jsx`'s
  `handleGoogleLogin` calls `signInWithGoogle()` then `legacyLogin()`, then
  `loginWithSession(...)` — a new method added to `AuthContext.jsx` for setting
  auth state directly from an already-obtained `{token, customerId}`, bypassing the
  normal `login(username, password)` path entirely.
- **Known unresolved gap (discussed, not built)**: a user who signs up via Google
  has no idea what their legacy password is (it's a random string). If they later
  try the *normal* email/password login form, it'll fail, since that form calls
  `authService.login()` directly against the legacy backend — it never touches the
  vault. Agreed direction (not yet implemented): let users set a real password via
  Firebase Auth's `linkWithCredential` (`EmailAuthProvider.credential(email, pw)`),
  then change the *normal* login form to do `signInWithEmailAndPassword` (Firebase)
  first, followed by the same `legacyLogin()` call Google already uses — decoupling
  the user's real password from the legacy one entirely, linked only via Firebase UID.
  This requires reworking `LoginPage.jsx`'s default `handleSubmit` to also go through
  Firebase Auth, not just `authService.login()`. Not done yet — explicitly deferred
  until after a demo.

## Local-only emulator setup (current priority — no public hosting yet)
Project owner is running everything locally for a demo (screen-share only, no public
deploy). Cloud Functions can't reach `localhost:8080` from Google's real infrastructure,
so a Firebase emulator setup was added instead of deploying:
- `firebase.json` has an `emulators` block (functions :5001, firestore :8085, auth
  :9099, UI :4000).
- `functions/.secret.local` (gitignored via the existing `*.local` rule) holds local
  values for `LEGACY_VAULT_KEY` and `LEGACY_BACKEND_URL=http://localhost:8080` —
  **still has a placeholder value for the key**, needs a real generated one before
  it'll work (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
- `src/services/firebase.js` auto-connects to the Functions emulator
  (`connectFunctionsEmulator(functions, 'localhost', 5001)`) whenever
  `import.meta.env.DEV` is true — zero effect on a real prod build, no manual toggle.
- **`.firebaserc` still has a placeholder project ID** (`REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID`)
  — needs to be the real Firebase project ID before any `firebase` CLI command
  (including the emulator) will work.
- Caution flagged earlier in the session: the user ran `firebase init` from a
  *different* unrelated project directory at one point and almost let it overwrite
  `functions/` and `firestore.rules` with unrelated scaffolding (it showed an unrelated
  list of Android apps from another Firebase project — a sign they were in the wrong
  directory or wrong Firebase project context). Worth double-checking
  `firebase projects:list` / `firebase use` point at the right project before running
  any more `firebase init`/`deploy` commands.

## Recent UI changes (made in a prior sandbox session — currently sitting as
**uncommitted local changes in this working tree**; nothing has been committed or
pushed yet, the user handles git themselves)
- `KYCSuccess.jsx` — added `verified` prop swapping accent color blue→green.
- `kycStatus.js` — rewritten to check Firebase Storage directly via `listAll()`
  instead of a stale localStorage flag (fixed a real bug: deleting a file from
  Storage didn't update the UI before this fix).
- `OptionsView.jsx` / `KycUploadSheet.jsx` — restyled to a native-iOS action-sheet
  look per a Figma mockup, added a working Cancel button.
- `SignUpPage.jsx` — biggest set of changes:
  - "done" stage redesigned: green verified shield, green-checkmark document rows,
    "Continue to Home" button, matches a provided mockup.
  - Added `Notification.requestPermission()` call on reaching the "done" stage.
  - Email stage redesigned: "Create your account" heading (replacing logo),
    "Continue with Google" button + divider, "Already have an account? Log in",
    Terms/Privacy footer text, a drag-handle + × close button (navigates to
    `/login`), top margin fix above the heading.
  - `ThemeToggle` ("Auto" button) removed from the email stage (and from
    `LoginPage.jsx` entirely) — explicitly temporary, "remove for this demo, bring
    back next demo." Don't be surprised it's commented out / removed — it's
    intentional, not a regression.
- `AccountPage.jsx` — added a "Don't have an account? Sign up" link under the
  sign-in button for logged-out users.
- Full responsive pass across `Header.jsx`, `BottomNav.jsx`, `ProductsPage.jsx`,
  `ProductDetailPage.jsx`, `Skeletons.jsx`, `DiscoverSection.jsx`, KYC sheet/camera/
  preview components (see "Architecture decisions" above for the pattern used).

## Outstanding/likely next asks
- Restore real values into `.firebaserc` and `functions/.secret.local` (currently
  placeholders).
- Decide on and implement the "let Google users set a real password" flow described
  above.
- Decide where the legacy backend will eventually be publicly hosted (Vercel was
  asked about for frontend; backend likely needs Railway/Render/Fly/Cloud Run since
  it's a long-running service, not serverless-friendly) — deferred, no action taken.
- A second Firebase email template (the "existing account" sign-in email that lands
  on `/login`) was offered but not yet drafted — only the signup one was.
- Nothing has been committed/pushed yet — there's a long backlog of uncommitted
  local changes across the files listed above. Only commit/push when the user
  explicitly asks.
