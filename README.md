# AI Readiness Check

A free, two-minute self-check that scores how ready a person is to use AI well, safely and responsibly in their own work. It gives a score out of 100 across five areas, a tier, specific next steps and a PDF. People can optionally share their scores anonymously, and the shared scores build a benchmark that you own.

Created by Tamara Marwood. Released under the [MIT licence](LICENSE): you may use, change and share it, including commercially, as long as you keep the copyright notice.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ttjoyy-tech/ai-readiness-check)

## Contents
1. [What it does](#what-it-does)
2. [What you need](#what-you-need)
3. [Deploy your own copy](#deploy-your-own-copy)
4. [Make it yours](#make-it-yours)
5. [Before you go live: checklist](#before-you-go-live-checklist)
6. [Viewing your results](#viewing-your-results)
7. [Privacy](#privacy)
8. [Updating, moving or removing your copy](#updating-moving-or-removing-your-copy)
9. [Troubleshooting](#troubleshooting)
10. [Limits of the check](#limits-of-the-check)
11. [Licence and credit](#licence-and-credit)

## What it does

- **Five scenario questions**, one for each area: Everyday use, Skills and judgement, Data and security, Responsible use, and Mindset and support.
- **Scoring:** each answer carries a credit of 100, 50, 25 or 0. An area score is the credit for the answer chosen. The overall score is the average of the five areas.
- **Four tiers:** Starting (0 to 30), Building (31 to 60), Leading (61 to 85) and Pacesetting (86 to 100). The cut-offs follow the Cisco AI Readiness Index. The questions and scoring are original.
- **Results page:** score, tier, a bar for each area, tips for the two lowest areas, and a comparison with published figures and, once enough people have shared, with your own shared scores.
- **PDF download**, built in the visitor's browser.
- **Optional anonymous sharing** into a database you control. Only averages are ever shown to the public, and only once at least 10 people have shared.
- **Group links:** add `?room=team-a` to the address to collect scores for one group in a private room that only you can see.
- **Answers stay on the visitor's device** unless they choose to share their scores.

## What you need

- A **free Cloudflare account**: [sign up here](https://dash.cloudflare.com/sign-up). Your copy runs on Cloudflare Workers with a D1 database, which a small site is likely to fit within the free tier. Check Cloudflare's current limits.
- A **free GitHub account**, for the button route.
- About 15 minutes. You don't need to write code to get a working copy.
- For the command-line route only: [Node.js](https://nodejs.org) version 18 or later.

## Deploy your own copy

### Route 1: the button (easiest)

1. Click **Deploy to Cloudflare** above and sign in to Cloudflare and GitHub when asked.
2. Cloudflare copies this project into **your** GitHub account, creates a **Worker** (the site and its small server) and a **D1 database** for it, and deploys it. Accept the suggested names, or choose your own.
3. If you are asked for `ADMIN_KEY`, enter a long random value (20 or more letters and numbers). It is the password for your results dashboard. If you are not asked, add it afterwards:
   - Cloudflare dashboard, then **Workers & Pages**, your project, **Settings**, **Variables and Secrets**, **Add**. Choose type **Secret**, name `ADMIN_KEY`, and paste your value.
4. Open the address Cloudflare gives you (it ends in `.workers.dev`). You should see the check.
5. Make it yours: in your new GitHub copy, edit `public/config.json` (see below) and commit the change. Cloudflare redeploys by itself within a minute or two.

### Route 2: the command line

```bash
git clone https://github.com/ttjoyy-tech/ai-readiness-check.git
cd ai-readiness-check
npm install
npx wrangler login
npx wrangler deploy                   # creates the Worker and the D1 database
npx wrangler secret put ADMIN_KEY     # paste a long random value when asked
```

The Worker creates its own database tables the first time it runs, so there is no separate database step. `schema.sql` is included if you prefer to set the database up by hand.

To try it on your own computer first, copy `.dev.vars.example` to `.dev.vars` and run `npm run dev`.

## Make it yours

Edit `public/config.json`. Leave a setting empty and that part is left out.

| Setting | What it does |
|---|---|
| `title` | The name shown at the top of the page and on the PDF |
| `owner` | Your name, shown beside the title and on the PDF |
| `organisation` | Named in the privacy notice as the person collecting shared scores |
| `email` | Contact address in the privacy notice and the PDF footer |
| `website` | Linked from the header and the PDF |
| `bookingUrl` | If set, the results page shows a button to this link, such as a calendar booking page |
| `bookingHeading`, `bookingButton` | The words on that card |

Other things you may want to change:

- **Comparison figures:** `public/benchmarks.json`. You can add your own reference group, but make sure you have the right to publish it.
- **Questions, tips, tiers and references:** the `PILLARS`, `QUESTIONS`, `TIPS`, `TIERS` and `REFS` lists near the top of the script in `public/index.html`. If you change the tier cut-offs, change `tierOf` in `worker.js` to match.
- **Colours and fonts:** the style block at the top of `public/index.html`.
- **Your own address:** in Cloudflare, your Worker, **Settings**, **Domains & Routes**, **Add**, **Custom domain**.

## Before you go live: checklist

- [ ] `ADMIN_KEY` is set, and you have kept a copy somewhere private
- [ ] `public/config.json` has your name, organisation and contact email, so the privacy notice names the right person
- [ ] You have read the [Privacy](#privacy) section and the wording on the page matches what your copy really does
- [ ] The reference links suit your country and audience (several point to Australian sources by default)
- [ ] You have taken the check yourself, shared a score, downloaded the PDF and opened your results dashboard
- [ ] You have deleted your test shares (see Updating, moving or removing)

## Viewing your results

Open `https://your-address/room?code=open&key=YOUR_ADMIN_KEY`.

- `open` is the public benchmark room. For a group link, use that group's code instead.
- The dashboard shows averages, tier counts and the full table once five people have shared. You can save it as a PDF or download a CSV.
- Treat that link like a password. Don't share it or put it on a slide.

## Privacy

The check is designed to collect as little as possible.

- **Stored only when someone chooses to share:** an overall score, five area scores, a time, and the sector, seniority and workplace-AI-access answers chosen at the start.
- **Never stored:** names, email addresses, IP addresses or answers to the questions.
- **Retention:** group-link rooms are deleted after 30 days. The public benchmark room is kept for 12 months. Both numbers are set at the top of `worker.js`.
- **Repeat-share limit:** a scrambled version of the network address is used only to count shares per day, and it is deleted after 3 days.

The wording shown to visitors is in `public/index.html`. **If you change any of these rules, change the wording to match.** You are responsible for meeting the privacy laws that apply to you. This project is not legal advice.

## Updating, moving or removing your copy

- **Update the design or wording:** edit the files in your GitHub copy and commit. Cloudflare redeploys.
- **Get later improvements from this project:** compare your copy with the original on GitHub and bring over the changes you want.
- **Delete test shares:** `npx wrangler d1 execute DB --remote --command "DELETE FROM results"`, or use the **D1** page in the Cloudflare dashboard.
- **Remove everything:** in the Cloudflare dashboard, delete the Worker under **Workers & Pages**, and delete the database under **D1**.

## Troubleshooting

| What you see | What to try |
|---|---|
| The page shows no name or contact details | Edit `public/config.json` and commit, then wait a minute or two |
| The dashboard says it needs the admin key | Use the full link with `&key=` followed by your `ADMIN_KEY`, with no spaces |
| Sharing fails with "database not ready" | Check that the Worker has a D1 database bound as `DB` (Settings, Bindings) |
| The benchmark never appears | It stays hidden until 10 people have shared to the public room |
| The PDF button does nothing | The PDF library loads from a public file host. Check your connection and any content blockers |
| Changes don't appear | Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) |

## Limits of the check

- It is a **self-report** and has not been formally validated. Treat a score as a snapshot and a conversation starter, not a measure of ability.
- There is one question for each area, so area scores can only take four values.
- The comparison figures describe organisations, not individuals, and any benchmark built from shared scores is self-selected, so it is not a representative sample.
- Some reference links (in the `PILLARS` and `REFS` lists in `public/index.html`) point to Australian sources, such as the OAIC and the Australian Government guidance. Replace them with sources that suit your audience and country.

## Licence and credit

Released under the [MIT licence](LICENSE). Copyright (c) 2026 Tamara Marwood. If you build on this, please keep the copyright notice. A link back is appreciated but not required. Issues and suggestions are welcome.
