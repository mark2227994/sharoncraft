# Agent instructions — SharonCraft (Vercel)

## Deployments: preview vs production (“Current”)

Vercel creates a **new deployment** for every push or CLI deploy. They are **not** the same URL unless you wire them that way.

- **`npm run deploy:preview`** or **`vercel deploy`** (no `--prod`) → **Preview only**. Does **not** move the deployment marked **Current** on Production or change `sharoncraft.co.ke` until you promote or merge.
- **`npm run deploy:prod`** or **`vercel deploy --prod`** → targets **Production** (what Vercel shows as **Current** for the production domain), when the CLI is linked to this project.
- **Git push to a feature branch** → Preview for that branch. **Git push to the branch Vercel uses for Production** (often `main`) → new Production build and **Current** moves to that commit.

## Rules for AI / automation

1. After a change, **do not** tell the user the “live” or “main” site is updated unless **one** of these happened:
   - push to the **production** branch (verify in Vercel → Settings → Git → Production Branch), or  
   - **`npm run deploy:prod`** completed successfully, or  
   - user **Promoted** the deployment in the Vercel dashboard.
2. If you only ran **`deploy:preview`** or pushed a **non-production** branch, say clearly: **“Preview only — production / Current unchanged.”**
3. Do not treat random `*.vercel.app` deployment URLs as permanent; use the **production domain** or the **branch preview** hostname from Vercel for stable testing.

## One-liner for “ship to the real site”

Merge to the production branch **or** run `npm run deploy:prod` (with Vercel CLI authenticated), then confirm the new deployment is **Current** in Vercel.
