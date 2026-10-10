# Junaed Portfolio Studio — first-time setup

The public portfolio stays a static website. The private **`/admin/` dashboard** runs entirely in your browser, while three small Vercel serverless functions authenticate your edits, upload images, and commit content to GitHub. A GitHub commit triggers a Vercel deployment.

**Important:** The dashboard is not operational just by opening `admin/index.html` from Windows Explorer. It requires Vercel deployment, GitHub access, and the environment variables below. You only configure those once. After that, edit and publish content from your browser without opening code files.

## 1. Update your existing GitHub repo

1. Download this updated ZIP, extract it, and open its inner `junaed-portfolio` folder.
2. Copy **all contents** of the inner folder, including `admin/`, `api/`, `lib/`, `content/`, `assets/`, `css/`, `js/`, `index.html`, and `package.json`, into the **existing local portfolio repository** that is connected to Vercel. Choose *Replace* for files with the same names. Don't delete the repository's `.git` folder.
3. Open CMD in the existing local portfolio repository and run:

```cmd
 git status
 git add .
 git commit -m "Add secure portfolio content management dashboard"
 git push origin main
```

If you have not created the GitHub repository yet, make a new **public** repository `junaed-portfolio`, run `git init`, `git branch -M main`, `git add .`, `git commit -m "Build portfolio and CMS"`, `git remote add origin https://github.com/junayedtiy4378/junaed-portfolio.git`, and `git push -u origin main`, then import it into Vercel with Framework Preset **Other**, repository root `/`, and no build command.

If Vercel is already connected to GitHub, this push begins a deployment. The `/admin` login will remain unconfigured until you add your secrets in the next steps.

## 2. Create a fine-grained GitHub token

1. Open GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens** → **Generate new token**. Alternatively visit <https://github.com/settings/personal-access-tokens/new> while signed in.
2. Resource owner: `junayedtiy4378` (or the actual repository owner).
3. Repository access: **Only select repositories**, then select `junaed-portfolio`.
4. Repository permissions → **Contents: Read and write**. Metadata is automatically read-only.
5. Set an expiration date and generate your token. Copy it once and keep it private. It will stop working at expiration, so renew it before then.

Never put the token into `index.html`, `admin.js`, `js/data.js`, or any GitHub-tracked file. Keep it only in Vercel's private environment-variable settings.

## 3. Add the environment variables in Vercel

Open [Vercel Dashboard](https://vercel.com/dashboard) → select your portfolio project → **Settings → Environment Variables**. Add the following variables under the **Production** environment (and Preview/Development only if you need editing there):

| Name | Example / instructions |
|------|------------------------|
| `ADMIN_PASSWORD` | A long, random password of at least 16 characters **you choose** |
| `SESSION_SECRET` | A separate random secret; use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` on your PC to generate 64 hexadecimal characters |
| `GITHUB_TOKEN` | The **fine-grained token** created in step 2 |
| `GITHUB_OWNER` | `junayedtiy4378` |
| `GITHUB_REPO` | `junaed-portfolio` (without `.git`) |
| `GITHUB_BRANCH` | `main` |

**Do not use your GitHub password for `ADMIN_PASSWORD`.** Choose a different, strong password. Don't share any of these values with others.

After saving your environment variables, go to **Deployments**, open the latest deployment's menu and choose **Redeploy** so the serverless functions can read the new configuration.

## 4. Open your new admin website

If your site uses `https://YOUR-PROJECT.vercel.app`, open:

`https://YOUR-PROJECT.vercel.app/admin/`

Log in using the **ADMIN_PASSWORD** you set in Vercel. You should see the Overview dashboard.

- **Profile & social:** name, contact details, location, semester, academic credits, links.
- **Hero & about:** headline, bio, profile picture, research tags.
- **Research:** main research description, status, tags, methodology steps.
- **Projects:** add/edit/delete/reorder cards, choose category, image, repository URL and visibility.
- **Skill groups:** add/edit/delete groups and their technologies.
- **Education:** search, add, edit, and reorder course records.
- **Publications:** add published work when it actually exists; hide drafts.
- **Interests:** add/edit research interest cards.
- **Custom sections:** create flexible cards for *Experience*, *Certifications*, *Awards*, *Leadership*, or any other topic. Each card can have a title, text, and URL.
- **Image library:** upload PNG, JPG, WEBP, or GIF under 1.5 MB. Copy the returned asset path to a project or avatar field. Uploads create their own commits immediately.

When done editing, click **Publish changes**. The backend writes `content/portfolio.json` to your GitHub repository. Vercel will automatically redeploy. The public site updates once the deployment succeeds (often within a minute, sometimes longer). **No edits appear publicly until the deployment finishes.** Use the Preview site button to check it.

## 5. Important operating notes

- The site only changes content; layout and new *application features* (e.g., custom backends, live chat, payments) still require engineering work.
- Images may be uploaded, but deletion of old uploaded images is not provided. The new picture or project uses its updated asset path once deployed.
- Sessions last 12 hours. Signing out clears the session cookie. The login cookie is HttpOnly, Secure and SameSite=Strict.
- GitHub's token and your password are read only by serverless functions. They never appear in visitor-facing JavaScript or in the repository.
- An incorrect token, insufficient permissions, or expired token will block saving. Replace `GITHUB_TOKEN` in Vercel and redeploy.
- If the dashboard says GitHub content changed, avoid overwriting someone else's work: reload after capturing your unsaved text, review the latest version, and reapply the change.
- Don't commit `.env` files: this project includes a `.gitignore` rule. `.env.example` contains placeholders only.
- Anyone can view the public portfolio, and its public content is stored in a GitHub repository; do **not** enter secrets, API keys, confidential research data, student records, or unpublished private documents into its content fields.
- The contact form on the public site opens the visitor's email app; it is not a stored inbox. The admin dashboard does not collect visitor messages.
- On a `file://` local preview, the public site falls back to the original bundled `js/data.js` because most browsers block JSON fetches from local files. For an accurate test of current content, use VS Code Live Server or `python -m http.server 8000` and visit `http://localhost:8000`.

## Troubleshooting

**Admin page opens but asks for setup:** Confirm all Vercel environment variables are set in Production and redeploy.

**Admin page gives 404:** Check that `admin/index.html`, `api/auth.js`, `api/content.js`, `api/media.js`, and `lib/server.js` are in the root of the deployed repository. Check Vercel's Project → Settings → Build and Deployment uses Framework Preset `Other` and Root Directory `./`. Use a trailing slash: `/admin/`.

**Unauthorized on save:** Sign out, sign back in, and try again. If needed, inspect browser developer tools for `/api/content` errors.

**GitHub 404 from the admin:** Check GitHub owner/repository name, repository token access, branch name, and that `content/portfolio.json` exists in GitHub.

**GitHub 403 from the admin:** Confirm fine-grained token permission **Contents: Read and write** on this repository, and that it has not expired.

**Save succeeds, but the public site hasn't changed:** Open Vercel → Deployments and wait for the new GitHub commit to finish deploying. If it fails, inspect Vercel build logs.

**Lost admin password:** Set a new value for `ADMIN_PASSWORD` in Vercel's Environment Variables and redeploy. No password-reset email is provided.

**Security note:** This is a personal single-admin CMS, not a multiuser platform. It supports credential-based login and basic origin checks, but doesn't include advanced distributed rate limiting, audit logging, multi-factor authentication, or a database. Consider managed authentication before granting multiple editors access or handling sensitive information.
