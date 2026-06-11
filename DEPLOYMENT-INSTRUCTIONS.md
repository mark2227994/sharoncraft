# SharonCraft Deployment Instructions

Use these instructions for any future AI or developer working on SharonCraft deployments.

## Source Of Truth

Do not deploy from this folder:

`C:\Users\USER\Desktop\projects\bead VN2`

Use this folder instead:

`C:\Users\USER\.codex\worktrees\3aac\bead VN2`

That worktree is the live-aligned deployment source for the storefront.

## Production Truth

Treat the live website as the source of truth:

- `https://www.sharoncraft.co.ke/`

Do not assume `main` or any other local branch matches production.

## Required Workflow

1. Open the project in:
   `C:\Users\USER\.codex\worktrees\3aac\bead VN2`

2. Make changes only in that workspace.

3. Create a preview deployment first:

   ```powershell
   vercel deploy
   ```

4. Compare the preview against:

   `https://www.sharoncraft.co.ke/`

5. Only after approval, deploy to production:

   ```powershell
   vercel deploy --prod
   ```

## Rules

- Never switch to another repo or worktree for storefront deployment work.
- Never assume the current repository root matches production.
- Always preview first.
- If the preview looks wrong, stop and compare it against live before making more changes.
- For storefront changes, use the live-aligned worktree above as the only deployment source.

## Prompt To Give Another AI

Use this exact instruction:

> Work only in `C:\Users\USER\.codex\worktrees\3aac\bead VN2`, treat `https://www.sharoncraft.co.ke/` as the source of truth, create a preview with `vercel deploy`, verify it matches live, and only then deploy with `vercel deploy --prod`.
