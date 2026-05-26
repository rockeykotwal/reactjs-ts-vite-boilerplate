You are performing a full git sync: stage → commit → pull if safe → push.
The user's commit message (if provided) is: $ARGUMENTS

Follow every step below in order. Stop and report clearly if any step fails.

---

## STEP 1 — Check working tree status

Run: `git status --short`

- If output is empty (nothing changed, nothing staged): tell the user "Nothing to commit — working tree is clean." and STOP. Do not proceed.
- Otherwise: note which files are modified, added, deleted, or untracked. Report a short summary to the user before continuing.

---

## STEP 2 — Detect current branch

Run: `git branch --show-current`

Store this as the active branch. Use it in every subsequent git command instead of hardcoding "main".

---

## STEP 3 — Stage all changes

Run: `git add -A`

Then run `git status --short` again to confirm files are staged (green). If nothing is staged after this, report and STOP.

---

## STEP 4 — Determine commit message

If `$ARGUMENTS` is non-empty, use it as the commit message exactly as provided.

If `$ARGUMENTS` is empty or blank:
- Run: `git diff --cached --stat`
- Read the output and write a short, clear conventional commit message yourself based on what changed (e.g. "feat: add user auth middleware", "fix: resolve drizzle query bug", "chore: update dependencies").
- Tell the user: "Auto-generated commit message: `<your message>`"

---

## STEP 5 — Commit

Run: `git commit -m "<commit message from Step 4>"`

**IMPORTANT:** Use only the commit message — do NOT append any `Co-Authored-By` trailer or attribution lines. The commit should show only the user's identity.

- If commit succeeds: report the commit hash and message.
- If commit fails (e.g. pre-commit hook error, nothing staged): show the error output clearly and STOP. Do not attempt to push.

---

## STEP 6 — Fetch remote silently

Run: `git fetch origin`

This downloads the latest remote state without touching the local branch. It is safe and read-only.

- If fetch fails (no network, no remote configured): warn the user — "Could not reach remote. Skipping pull/push." and STOP.

---

## STEP 7 — Check if remote is ahead

Run: `git log HEAD..origin/<branch> --oneline`

Where `<branch>` is the branch name from Step 2.

- If output is EMPTY: remote has no new commits. Skip to Step 10 (push directly).
- If output is NON-EMPTY: remote has commits you don't have locally. Continue to Step 8.

---

## STEP 8 — Dry-run merge to detect conflicts

Run: `git merge --no-commit --no-ff origin/<branch>`

This attempts a merge in memory without creating a commit. It reveals whether conflicts exist.

**Case A — Merge succeeds (no conflicts):**
- The command exits with code 0 and says "Automatic merge went well"
- Run `git merge --abort` immediately to undo the dry-run state
- Tell the user: "Remote has new commits. Merge is clean — will pull and push."
- Continue to Step 9.

**Case B — Merge fails (conflicts detected):**
- The command exits with a non-zero code or says "CONFLICT"
- Run `git merge --abort` to restore clean state
- Run `git diff --name-only --diff-filter=U` to list conflicting files (if any are shown)
- Tell the user clearly:
  - "Conflict detected — cannot auto-merge remote changes."
  - List the conflicting files
  - "Please resolve the conflicts manually, then re-run /git-sync."
- STOP. Do not push.

---

## STEP 9 — Pull remote changes (only reached if Step 8 was Case A)

Run: `git pull origin <branch> --no-rebase`

- If pull succeeds: confirm to user and continue to Step 10.
- If pull fails for any reason: report the error and STOP. Do not push.

---

## STEP 10 — Push to remote

Run: `git push origin <branch>`

- If push succeeds: report success with the branch name and latest commit hash (`git log -1 --oneline`). Continue to Step 11.
- If push fails with "rejected" or "non-fast-forward": this means remote moved again between fetch and push (rare race condition). Tell the user to run `/git-sync` again.
- If push fails for any other reason: show the full error output.

---

## STEP 11 — Open Pull Request (non-main branches only)

Only run this step if the branch from Step 2 is NOT `main`.

Check if a PR already exists for this branch:

Run: `gh pr list --head <branch> --state open --json number,url`

**Case A — PR already exists:**
- Report the existing PR URL to the user. Do not create a new one.

**Case B — No PR exists:**
- Create a new PR targeting `main`:

Run:
```
gh pr create --title "<commit message from Step 4>" --base main --head <branch> --body "$(cat <<'EOF'
## Summary
- <one-line description of changes based on the diff>

## Branch
`<branch>` → `main`
EOF
)"
```

- Report the new PR URL to the user.
- If `gh` is not installed or not authenticated: warn the user and skip silently.

---

## FINAL REPORT

After all steps, give the user a one-paragraph summary:
- What was committed (message + hash)
- Whether a pull happened
- Whether the push succeeded
- Whether a PR was created or already existed (include the URL), or was skipped because branch is main
- If anything was skipped or failed, say why clearly

Never silently skip a step. Always tell the user what you did and what happened.
