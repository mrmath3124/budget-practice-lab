# Budget Practice Lab

A practice simulator for teaching New Jersey school district budget entry. The screens, menus, and line numbers follow the state's web-based district budget software. It's loaded with Elmwood Park's adopted 2026-27 budget, which is a public record.

Students can enter amounts on any screen and watch them flow through the rest of the budget. A pass/fail scorecard checks the result.

> Training use only. This is not the official state software and is not affiliated with or endorsed by the New Jersey Department of Education. Nothing entered here is sent anywhere.

## Modes

- **Guided Walkthrough.** Key amounts are blanked out, and 14 steps walk students through entering them. Along the way they see how the amounts move from Enrollment, SEMI and the Recap into Revenues, through the cap calculations, and finally to a balanced budget with no fatal edits.
- **Scenario Challenges.** There are six scenarios: State Aid Cut, Health Benefits Spike, Enrollment Growth, Zero Tax Increase, Separate Proposal, and Excess Surplus Surprise. Each one has goals that must turn green along with every required check.
- **Open Sandbox.** Students start from the full adopted budget and can change anything.

Work saves automatically in the student's browser, separately for each mode. **Save work to file** downloads a `.json` file that students can hand in or reopen on another computer. **Results page** prints the scorecard and every line the student changed.

## Publish on GitHub Pages

1. Create a new repository on GitHub, for example `budget-practice-lab`.
2. Upload every file in this folder to the repository's main branch, keeping the folders (`css`, `js`, `docs`, `tests`) and the `.nojekyll` file.
3. In the repository, go to **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`, and save.
4. After a minute or two, the site will be at `https://<your-username>.github.io/budget-practice-lab/`. Share that link with students. They don't need an account.

GitHub Pages sites are public. Anyone with the link can open the site.

### Run it offline

Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari). No internet or install is needed.

## How accurate is it?

The calculations were rebuilt from a read-only review of the 2026-27 screens. They were checked against the district's actual figures:

- All 140 revenue and appropriation totals match for all three years.
- 48 cross-screen and calculation values match the state software exactly. That includes the Recap balances, SEMI, Preschool Education Aid, Excess Surplus, the Prebudget Levy, Health Care, the Tax Levy Cap, Minimum Levy, District Status, Cap Banking, Enrollment, Administrative Cost Limit, A4F and the tax rate.
- A few items are simplified, and each is labeled on its screen:
  - the administrative cost benefit share and limit
  - the per-pupil cost estimates
  - the tuition rate detail, which is display only
  - fatal edits the district never triggered, which were modeled from the published rules

See `docs/DATA-FLOW.md` for the map of how the screens feed each other, and `docs/INSTRUCTOR-GUIDE.md` for teaching notes and scenario answer approaches.

To re-run the accuracy check, use `node tests/engine.test.js`. It requires Node.js and prints `fail 0` when everything matches.
