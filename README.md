# programme-structure

A standard JSON structure for South African TVET college programmes, plus the converted
course data — so an applicant can be told **YES / NO** whether they qualify for a course
before they apply.

## What's in this repo

| Path | What it is |
|---|---|
| `programme_structure.json` | The canonical schema, shown as one complete programme (entry requirements included). |
| `tvet/<college>.json` | One file per college — every programme that college offers, in the canonical structure. |
| `tvet/index.json` | Machine-readable index of all colleges (name, province, file, programme counts by type). |
| `eligibility.js` | Dependency-free reference checker — answers `YES` / `NO` / `REVIEW` for an applicant profile. |
| `validate.js` | Schema validator: `node validate.js` must report 0 errors. |

**25 colleges · 756 programmes** (updated 2026-10-06).

## Schema

Every entry is exactly the object shape defined in
[`programme_structure.json`](programme_structure.json):

```json
{
  "institution": "Lovedale TVET College",
  "programme": {
    "name": "Occupational Certificate: Solar Photovoltaic Standalone Installer",
    "description": null,
    "saqa_code": null,
    "type": "OC",
    "nqf_level": 4,
    "faculty": null,
    "duration": { "value": 12, "unit": "months" },
    "credits": 360,
    "attendance": ["full-time", "part-time"],
    "campus": null,
    "intake": []
  },
  "entry_requirements": {
    "age": { "min": 16, "max": null },
    "match": "any",
    "options": [
      { "type": "grade", "level": 11, "aps": null, "subjects": [ ... ] },
      { "type": "ncv", "level": 3, "subjects": [ ... ] },
      { "type": "abet", "level": 4, "subjects": [ ... ] },
      { "type": "nqf", "level": 3, "field": null },
      { "type": "nated", "level": "N3", "subjects": [] },
      { "type": "plp", "accepted": true },
      { "type": "rpl", "accepted": true }
    ],
    "notes": ["Optional extra rules quoted from the college source."]
  }
}
```

Key points:

- **`programme.type`** — `NCV` · `NATED` · `OC` (Occupational Certificate) · `SKILLS` · `APPRENTICESHIP` · `OTHER`.
- **`programme.nqf_level`** — NCV L2/L3/L4 → 2/3/4; NATED N1–N3 → 4; N4–N6 → 5; National N Diploma → 6. `null` when the source does not state a level.
- **`entry_requirements.match: "any"`** — satisfying **any one** option is enough (Grade 12 *or* NCV L4 *or* N3 …). `"all"` means every option must be met (rare).
- **`options[].subjects[]`** — admission subjects only (a programme's *curriculum* subjects are not entry requirements). One row per requirement line; `"or"` alternatives live in one row's `choices` array with `match: "any"`, `"and"` requirements are separate rows with `compulsory: true`.
- **`nated` option type** is a documented extension for Report 191 certificates (`"N1"`–`"N6"`).
- Anything the source does not state is `null` / `[]` — never invented. Where a college source stated no requirements, the standard national TVET minimum is used and flagged in `entry_requirements.notes`.

## Course data

| College | Province | Programmes | Types |
|---|---|---|---|
| [Boland TVET College](tvet/boland-tvet-college.json) | Western Cape | 18 | OC 12, NCV 6 |
| [Capricorn TVET College](tvet/capricorn-tvet-college.json) | Limpopo | 33 | NCV 17, OC 9, NATED 7 |
| [Eastcape Midlands TVET College](tvet/eastcape-midlands-tvet-college.json) | Eastern Cape | 19 | OC 19 |
| [Ehlanzeni TVET College](tvet/ehlanzeni-tvet-college.json) | Mpumalanga | 66 | NCV 27, OC 28, SKILLS 11 |
| [Elangeni TVET College](tvet/elangeni-tvet-college.json) | KwaZulu-Natal | 1 | NCV 1 |
| [Flavius Mareka TVET College](tvet/flavius-mareka-tvet-college.json) | Free State | 9 | NCV 5, OC 4 |
| [Gert Sibande TVET College](tvet/gert-sibande-tvet-college.json) | Mpumalanga | 29 | NCV 23, NATED 6 |
| [Letaba TVET College](tvet/letaba-tvet-college.json) | Limpopo | 17 | NCV 8, NATED 6, SKILLS 3 |
| [Lovedale TVET College](tvet/lovedale-tvet-college.json) | Eastern Cape | 16 | NCV 2, OC 14 |
| [Majuba TVET College](tvet/majuba-tvet-college.json) | KwaZulu-Natal | 50 | NCV 21, OC 11, SKILLS 6, APPRENTICESHIP 7, NATED 5 |
| [Maluti TVET College](tvet/maluti-tvet-college.json) | Free State | 6 | NCV 6 |
| [Mnambithi TVET College](tvet/mnambithi-tvet-college.json) | KwaZulu-Natal | 41 | NCV 9, NATED 8, OC 16, SKILLS 4, APPRENTICESHIP 3, OTHER 1 |
| [Mopani TVET College](tvet/mopani-tvet-college.json) | Limpopo | 39 | OC 19, NCV 10, NATED 9, OTHER 1 |
| [Motheo TVET College](tvet/motheo-tvet-college.json) | Free State | 76 | NCV 56, OC 17, SKILLS 3 |
| [Mthashana TVET College](tvet/mthashana-tvet-college.json) | KwaZulu-Natal | 22 | NCV 8, OC 14 |
| [Nkangala TVET College](tvet/nkangala-tvet-college.json) | Mpumalanga | 45 | NCV 13, NATED 9, OC 22, OTHER 1 |
| [Northern Cape Rural TVET College](tvet/northern-cape-rural-tvet-college.json) | Northern Cape | 18 | NCV 7, OC 11 |
| [Northern Cape Urban TVET College](tvet/northern-cape-urban-tvet-college.json) | Northern Cape | 24 | NCV 15, APPRENTICESHIP 4, SKILLS 5 |
| [Orbit TVET College](tvet/orbit-tvet-college.json) | North West | 31 | NCV 30, OTHER 1 |
| [Taletso TVET College](tvet/taletso-tvet-college.json) | North West | 32 | NCV 10, NATED 4, OC 18 |
| [Thekwini TVET College](tvet/thekwini-tvet-college.json) | KwaZulu-Natal | 42 | OC 13, NCV 7, NATED 11, SKILLS 7, OTHER 4 |
| [Umfolozi TVET College](tvet/umfolozi-tvet-college.json) | KwaZulu-Natal | 51 | NCV 17, OC 24, APPRENTICESHIP 8, SKILLS 2 |
| [Vhembe TVET College](tvet/vhembe-tvet-college.json) | Limpopo | 27 | NCV 14, NATED 13 |
| [Vuselela TVET College](tvet/vuselela-tvet-college.json) | North West | 30 | NCV 6, OC 24 |
| [Waterberg TVET College](tvet/waterberg-tvet-college.json) | Limpopo | 14 | NCV 10, OC 4 |

## Am I eligible? (YES / NO / REVIEW)

`eligibility.js` evaluates an applicant profile against `entry_requirements`:

- **YES** — at least one admissions pathway is fully satisfied (`match: "any"`), or all of them are (`match: "all"`), and the minimum age is met.
- **NO** — every pathway is known and failed, or the applicant is under the minimum age.
- **REVIEW** — not enough data to decide (usually a required subject mark or APS was not supplied), or the only remaining pathway is a PLP test or RPL assessment that must be booked.

Profile conventions: level fields left `null` (`ncv_level`, `nated`, `nqf_level`, `abet_level`) mean **not held**; subject marks you do not supply are treated as **unknown**, which yields `REVIEW` rather than a wrong `NO`. A profile with no details at all returns `REVIEW` everywhere.

```js
const { checkProgramme, checkAll } = require('./eligibility.js');

const profile = {
  grade: 12, aps: 30,
  subjects: { 'Mathematics': 65, 'English': 60, 'Physical Sciences': 55 },
  ncv_level: null, nated: 'N3', nqf_level: null, abet_level: null,
  plp: null, rpl: null, age: 19
};

const college = require('./tvet/letaba-tvet-college.json');
const entry = college.programmes.find(p => p.programme.name.includes('Business Management'));

console.log(checkProgramme(profile, entry));
// -> { result: 'YES', matchedOption: 0, ageBlock: false, notes: [...] }

// or grade an entire college:
console.log(checkAll(profile, college.programmes));
```

In a browser, include the script and use `window.NevableEligibility.checkProgramme(...)`.

Subject names are matched loosely (`Maths` → `Mathematics`, `English FAL` → `English`,
`Physical Science` → `Physical Sciences`), so profile keys do not have to be exact.

## Validate

```
node validate.js
```

## Data provenance

Programmes were converted from college programme/curriculum documents supplied as plain
text. Requirements are reproduced faithfully; where a document was silent, the standard
national TVET minimum is shown and called out in `entry_requirements.notes`. Always
confirm final admission decisions with the college — this repo is a guide, not an offer
of admission.
