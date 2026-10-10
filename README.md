# Junaed Ahmed — Professional Portfolio + Admin Dashboard

A responsive research/software-engineering portfolio (dark and green UI), now equipped with a private browser-based content management dashboard.

## Start here

**If you have already deployed an earlier version to GitHub + Vercel:** Follow [ADMIN_SETUP.md](ADMIN_SETUP.md) to push this replacement package into your existing repository, create a limited GitHub token, and configure your Vercel environment variables.

**If you have never deployed before:** Follow the first-time instructions in `ADMIN_SETUP.md` to create a GitHub repository and deploy it to Vercel.

Once published:

- Public website: `https://YOUR-PROJECT.vercel.app/`
- Private editor: `https://YOUR-PROJECT.vercel.app/admin/`

The admin login does *not* work from a plain file opened on your computer. Vercel serverless functions and environment variables are required. Do not put your admin password or GitHub token into repository files.

## What you can manage through /admin/

- Profile, links, location, academic status, contact invitation, footer text
- Home hero, introduction, About biography, tags, profile image
- Featured research and its workflow steps
- Projects, categories, URLs, technology stacks, images, featured/hidden status, ordering
- Skill groups and skills within each group
- University coursework and categories
- Publications, preprints and talks (enter only verifiable items)
- Research interests
- **Entire new content sections** such as Experience, Certifications, Awards, Leadership and Activities, with multiple cards
- Portfolio images (GitHub-backed image uploads, 1.5MB each)

Changes stay in the editor until you click **Publish changes**. Publishing commits `content/portfolio.json` to GitHub and triggers a normal Vercel deployment. No code editing required for those content updates.

## Folder structure

```text
junaed-portfolio/
├── index.html                 Public portfolio
├── css/styles.css             Website presentation
├── js/main.js                 Public content rendering
├── js/data.js                 Offline-preview fallback of original data
├── content/portfolio.json     Live content, edited by /admin/
├── admin/index.html           Dashboard, authentication screen, content forms
├── admin/admin.css            Dashboard styling
├── admin/admin.js             Admin UI logic
├── api/auth.js                Login/session/logout Vercel function
├── api/content.js             Read/publish content Vercel function
├── api/media.js               Image uploader Vercel function
├── lib/server.js              Server security and GitHub content API helper
├── assets/                    Public images / icons
├── tools/editor.html          Legacy editor migration notice
├── .env.example               Example variable names ONLY (no secrets)
└── ADMIN_SETUP.md             Detailed deployment and secrets setup
```

## How content synchronization works

1. `content/portfolio.json` in your GitHub repository is the **source of truth**.
2. The public `js/main.js` fetches that file from the current site and renders updated content. For offline `file://` previews only, it falls back to the bundled initial `js/data.js`.
3. The admin dashboard fetches content and its GitHub file revision via `/api/content` after a successful login.
4. On Publish, a serverless function updates `content/portfolio.json` via GitHub's Contents API. The private fine-grained token stays on the server.
5. GitHub notifies Vercel of the commit, and the production website updates once the new deployment finishes.

This architecture does not use a paid database or ongoing manually executed Git commands for each edit. You still need to keep the limited GitHub token valid and use Vercel hosting.

## Editing and deployment limits

The content dashboard cannot create arbitrary app logic. New UI components, backend services, page redesigns, and new admin field types require code changes. Visitors do not have admin access. The contact form is mailto-based and does not store inbox messages. The public portfolio should not contain confidential documents or credentials.

Academic coursework originally comes from your supplied BRAC University unofficial grade sheet through Summer 2026 (114 earned credits and 38 completed credit-bearing courses). Grades and student ID are **not** part of public content. Initial research is correctly labeled as ongoing, not as a confirmed publication.

### Locally preview the public website

In the root folder, start a local static server:

```cmd
python -m http.server 8000
```

Open `http://localhost:8000`. This previews the public site from current `content/portfolio.json`. The **private admin cannot save** on a normal Python server; it needs a configured Vercel deployment.

## Security reminders

- Store `ADMIN_PASSWORD`, `SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH` in **Vercel Environment Variables**.
- Use a GitHub fine-grained token with repository access restricted to the single portfolio repo and **Contents: Read and write**.
- Don't paste credentials in chats, screenshots, frontend JavaScript, a `.env` file committed to Git, or README documents.
- Publishing makes portfolio text public through your GitHub repo and deployed site.

Detailed troubleshooting and a full deployment checklist: [ADMIN_SETUP.md](ADMIN_SETUP.md).
