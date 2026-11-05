# AI Readiness Check

A free, two-minute self-check that scores how ready a person is to use AI well, safely and responsibly in their own work. It gives a score out of 100 across five areas, a tier, specific next steps and a branded PDF. People can optionally share their scores anonymously, and the shared scores build a benchmark you own.

Created by Tamara Marwood. Released under the [MIT licence](LICENSE).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ttjoyy-tech/ai-readiness-check)

*The button works once this repository is public.*

## What it does

- **Five scenario questions**, one for each area: Everyday use, Skills and judgement, Data and security, Responsible use, Mindset and support.
- **Scoring:** each answer carries a credit of 100, 50, 25 or 0. An area score is the credit for the answer chosen. The overall score is the average of the five areas.
- **Four tiers:** Starting (0 to 30), Building (31 to 60), Leading (61 to 85) and Pacesetting (86 to 100). The cut-offs follow the Cisco AI Readiness Index. The questions and scoring are original.
- **Results page:** score, tier, a bar for each area, tips for the two lowest areas and a comparison with published figures and, once enough people have shared, with your own shared scores.
- **PDF download** built in the browser.
- **Optional anonymous sharing** into a database you control. Only averages are ever published, and only once at least 10 people have shared.
- **Group links:** add `?room=team-a` to the address to collect scores for one group in a private room, visible only to you.
- **Answers stay on the visitor's device** unless they choose to share their scores.

## Deploy your own copy

You need a free [Cloudflare account](https://dash.cloudflare.com/sign-up) and, for the manual route, [Node.js](https://nodejs.org).

### Option 1: the button
1. Click **Deploy to Cloudflare** above and follow the prompts. Cloudflare copies the repository to your GitHub account and creates a Worker and a D1 database for it.
2. When asked for `ADMIN_KEY`, enter a long random value. It protects your results dashboard. Keep it private.
3. Edit `public/config.json` in your copy (see below) and commit. Cloudflare redeploys automatically.

### Option 2: from the command line
```bash
git clone https://github.com/ttjoyy-tech/ai-readiness-check.git
cd ai-readiness-check
npm install
npx wrangler login
npx wrangler deploy              # creates the Worker and the D1 database
npx wrangler secret put ADMIN_KEY
```
The Worker creates its own tables the first time it runs, so there is no separate database step. `schema.sql` is included if you prefer to set the database up by hand.

## Make it yours

Edit `public/config.json`:

| Setting | What it does |
|---|---|
| `title` | The name shown at the top and on the PDF |
| `owner` | Your name, shown beside the title and on the PDF |
| `organisation` | Named in the privacy notice as the person collecting shared scores |
| `email` | Contact address in the privacy notice and PDF footer |
| `website` | Linked from the header and the PDF |
| `bookingUrl` | If set, the results page shows a button to this link (a calendar page, for example) |
| `bookingHeading`, `bookingButton` | The words on that card |

Leave a setting empty and that part is simply left out.

To change the published comparison figures, edit `public/benchmarks.json`. You can add your own reference group there, but check you have the right to publish it.

To change the questions, tips or tiers, edit the `PILLARS`, `QUESTIONS`, `TIPS` and `TIERS` lists near the top of the script in `public/index.html`. If you change the tier cut-offs, change `tierOf` in `worker.js` to match.

## Viewing results

Open `https://your-site/room?code=open&key=YOUR_ADMIN_KEY`. `open` is the public benchmark room. For a group link, use that group's code. The dashboard shows averages, tier counts and the full table once five people have shared, and you can save it as a PDF or CSV. Treat that link like a password.

## Privacy: read this before you go live

The check is designed to collect as little as possible.

- **Stored when someone chooses to share:** an overall score, five area scores, a time, and the sector, seniority and workplace-AI-access answers chosen at the start.
- **Never stored:** names, emails, IP addresses or answers to the questions.
- **Retention:** group-link rooms are deleted after 30 days. The public benchmark room is kept 12 months. Both numbers are set at the top of `worker.js`.
- **Repeat-share limit:** a scrambled version of the network address is used only to count shares per day, and it is deleted after 3 days.

The privacy wording shown to visitors is in `public/index.html`. **If you change any of these rules, change the wording to match.** You are responsible for meeting the privacy laws that apply to you. This project is not legal advice.

## Limits of the check

- It is a **self-report** and has not been formally validated. Treat a score as a snapshot and a conversation starter, not a measure of ability.
- There is one question for each area, so area scores can only take four values.
- The comparison figures describe organisations, not individuals, and any benchmark built from shared scores is self-selected, so it is not a representative sample.
- Some of the reference links (in the `PILLARS` and `REFS` lists in `public/index.html`) point to Australian sources, such as the OAIC and the Australian Government guidance. Replace them with sources that suit your audience and country.

## Costs

A small deployment is likely to fit comfortably inside Cloudflare's free tier. Check Cloudflare's current limits and pricing for Workers and D1.

## Contributing and credit

Issues and suggestions are welcome. If you build on this, please keep the copyright line in the licence. A link back is appreciated but not required.
