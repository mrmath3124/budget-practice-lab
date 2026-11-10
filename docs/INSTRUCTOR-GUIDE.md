# Instructor Guide: Budget Practice Lab

## Before class

- Share the GitHub Pages link. Students choose a mode on the Home screen.
- Each mode keeps its own saved work in the student's browser. **Start over** clears only the mode the student is in.
- Students hand in work with **Save work to file** (a `.json` file) or a printed **Results page**. You can open a student's file with **Open saved file** to see exactly what they entered.

## Reading the screens

- **Green amounts** are entered by the district. Click one to edit it.
- **Black amounts** are calculated. A small arrow means the line is filled in from another screen. Hover over it to see which one.
- **Shaded rows** are totals. Each line rolls up through its "Sum To Line".
- **Yellow flash:** when a student opens a screen, any amount that changed since their last visit flashes yellow. This is the easiest way to show a number moving.
- Locked lines, such as state aid and lines no longer used, can't be edited, just like in the real software.

## Main flows to demonstrate

1. Enrollment feeds the Administrative Cost Limit enrollment (2,682).
2. SEMI sends 90% of projected revenue to Revenue line 540.
3. Appropriation of Excess Surplus line D1 has to be budgeted on Recap line 14. From there it goes to Revenue line 580. If it isn't budgeted, fatal edit 1007 appears.
4. Recap reserve interest, deposits and withdrawals feed Revenue lines 320-340 and 600-678, and Appropriation lines 72160-72247 and 76340-76380.
5. Health Benefits on Appropriation line 71180 feeds Health Care Costs line A1. Line G of that screen becomes Tax Levy Cap line B.
6. The Prebudget Year Levy screen (last year's levy, plus the enrollment adjustment, plus 2%) becomes Tax Levy Cap line A. Revenue line 100 has to be at or below cap line I and at or above the Minimum Tax Levy (line D).
7. Revenue lines 114 and 860 feed the A4F calendar-year levy, which feeds the estimated tax rate.
8. The Preschool Education Aid detail feeds Revenue lines 755, 760, 835 and 836, and Appropriation lines 2040, 2060 and 85000-87040. The PEA revenues have to equal the PEA program budget.

## Scenario answer approaches

There's more than one correct answer for each scenario. These are the moves that work:

| Scenario | What changes | A path that passes |
|---|---|---|
| State Aid Cut | Equalization Aid down 5% (-$1,167,679) | Raise the levy to the cap (+$999,196 of room from the health care adjustment). Then cut about $168,500 from non-instructional lines, such as transportation or purchased services, or budget a maintenance reserve withdrawal for required maintenance. |
| Health Benefits Spike | Line 71180 must be at least $10,143,108; SHBP is now 14% | Raise line 71180. The health care adjustment rises to $917,364, so set the levy to the new cap ($38,548,328). About $169,000 still has to be cut or covered by up to $100,000 of banked cap. Unassigned fund balance can't go down. |
| Enrollment Growth | WENR rises to 2,960 | Enter 860 on Enrollment line 5, add $190,000 to line 2100 and $450,000 to line 29100, and explain the growth on Enrollment line 25. The enrollment adjustment raises the cap to about $39.2M, so the levy can cover the cost. |
| Zero Tax Increase | Line 100 can't exceed $36,893,102 (-$737,862) | Combine savings with a maintenance reserve withdrawal (Recap line 43, no more than required maintenance), and keep instruction within 1%. The minimum levy equals last year's levy, so the levy can't go any lower than that. |
| Separate Proposal | No health care adjustment, so the levy equals the cap | Add $750,000 to line 43080 and enter a separate proposal for $750,000 on Calculations > Separate Proposals. It flows to Revenue line 111, outside the cap. |
| Excess Surplus Surprise | Audit excess surplus is $1,600,000 | Enter $1,600,000 on Recap line 14, which flows to Revenue line 580. Lower the levy by at least $485,889, and don't raise General Fund appropriations. |

## Known simplifications

- **Administrative Cost Limit:** benefits are shared out in proportion to administrative salaries, calibrated to match the district's 2026-27 figure. The limit is the regional limit per pupil.
- **Per Pupil Costs:** only Total Administrative Costs (IND8PP) is calculated exactly. The others move in proportion to the related appropriations.
- **Tuition rates:** display only, showing the district's actual 2026-27 calculation. The Formulas screen (A and B) is fully calculated.
- **Fatal edits:** these follow the published rules, such as funds balancing, levy within the cap and at or above the minimum, no negative balances, excess surplus budgeted, SEMI at least 90%, and PEA balanced. They're simplified versions of the state's edit logic. The warnings match the ones the district actually received.
- **Advertised explanations:** the warning for changes of 10% or more without an explanation is a simulator rule.
- **Real staff data:** contract information isn't included. That screen is a blank practice form.

## Updating for a new year

When a new budget year's software opens, the screens can be captured again (read-only) and the data file (`js/data.js`) rebuilt. Rerun `tests/engine.test.js` after any update.
