# Budget Online (2026-27) — how the tabs feed each other

Source: Elmwood Park (Bergen) budget27 screens, captured read-only on 2026-11-03.
Column key: Y1 = 2024-25 actual (Audsum, locked), Y2 = 2025-26 revised, Y3 = 2026-27 proposed.
"VERIFIED" = reproduced exactly from captured numbers. "MODELED" = built from screen formula text / public rules.

## 1. Roll-ups inside Revenues and Appropriations — VERIFIED
Every line has a "Sum To Line". Parent = sum of its children, all 3 years.
Checked: 16 revenue totals and 124 appropriation totals, 0 mismatches.
- Revenues: 100/111/112 -> 114 -> 370 -> 720 (General Fund) -> 1000; Special Revenue -> 840 -> 1000; Debt Service -> 895 -> 935 -> 1000.
- Appropriations: line items -> program/function totals -> 72140 Undistributed -> 72260 Current Expense -> 84060 GF Grand Total -> 90000; 88760 Special Revenue; 89980 Debt Service.
- Balance test: Rev 1000 = App 90000 (76,432,681); by fund 720=84060, 840=88760, 935=89980.

## 2. Lines fed from other screens ("ENTRY ON ..." lines, locked on the grid) — VERIFIED
| From screen | Field | Lands on |
|---|---|---|
| Recap of Balances | Budgeted excess surplus / unassigned withdrawal | Rev 580 |
| Recap | Reserve interest (emergency / maintenance / capital) | Rev 320/330/340 and App 72240/72180/76380 |
| Recap | Reserve withdrawals (capital, maintenance, emergency, etc.) | Rev 600-678 |
| Recap | Capital reserve transfer to debt service | Rev 625 + App 76340 (GF) and Rev 855 (DS) |
| Recap | Student activity / scholarship | Rev 737/738 = App 84200/84220 |
| Recap | Debt service fund balance withdrawal | Rev 892 |
| SEMI | 90% of projected SEMI | Rev 540 |
| PEA detail | GF contribution regular / inclusion | Rev 835/836 and App 2040/2060 (GF) |
| PEA detail | Prior-year carryover, current PEA, tuition, PEA levy | Rev 755/760/725/730/723 |
| PEA detail | Program line items | App 85000-87040 -> 87100 |
| Capital Projects | Transfers to capital projects | App 76240/76320 |
| Separate Proposals | Passed proposals | Rev 111/112 |

## 3. Calculations — formulas
- Adjusted Prebudget Levy (VERIFIED): D = prior base levy + passed SPs + c.44 adj - non-permanent SPs; F = D / prior WENR; enrollment adjustment weighted by growth band (<=1% 0, 1-2.5% .5, 2.5-4% .75, >4% 1.0) x F; R = (D + adj) x 1.02.
- Health Care Adjustment (VERIFIED): A4 = App 71180 - dental/vision - emergency withdrawal; C = B4 x 1.02; D = A4 - C; F = B4 x (SHBP% - 2%); G = lesser of D, F (not below 0).
- Tax Levy Cap (VERIFIED): I = R + health care + pension + responsibility +/- + other + banked cap used. Rev 100 must be <= I.
- Minimum Tax Levy (VERIFIED): lesser of adequacy budget, local fair share, adjusted prior levy. Rev 100 must be >= D.
- District Status (VERIFIED): levy + equalization aid (Rev 460) vs adequacy budget.
- Cap Banking (VERIFIED): banked = cap - levy; 3-year expiry.
- Excess Surplus (VERIFIED): C = greater of 2% x (prior GF appropriations - encumbrances) or $250,000; excess = adjusted free balance - C.
- Recap (VERIFIED pattern): Y3 beginning = Y2 ending; ending = beginning + increases - withdrawals.
- Admin Cost Limit (MODELED): admin per pupil = admin lines + share of unallocated benefits / enrollment (from Enrollment screen).
- Enrollment (VERIFIED): H = full-time + 1/2 shared + sent + private-disabled; J = H - prior; growth must sit in DOE range.
- Tax Levy Cert / Tax rate (VERIFIED): calendar levy = 1/2 prior + 1/2 new; rate = levy / valuation x 100.
- Tuition rates (MODELED): allocate prior-year costs by ADE ratios, add Formula A (building use) and B (allocated costs), inflate, divide by ADE.

## 4. Edit checks seen (rule syntax RE/AP/RP/CL = screen, /3 = Y3)
Warnings captured: tuition budgeted, GF to PEA inclusion, admin cost base, fund balance < 2%/$250k,
capital reserve vs LRFP, maintenance reserve max, student activity balance, alt valuation, deferral.
Fatal edits (not triggered here; MODELED from rules): revenues != appropriations by fund, levy > cap,
levy < minimum levy, negative ending balances, SEMI < 90% without waiver, admin cost over limit.

## Not mapped (by design)
Contract Information for Select Staff (individual employee data) and Statement of Priorities (narrative).
UFB / Advertised Budget are PDF outputs; the simulator will generate its own summary from the data.
