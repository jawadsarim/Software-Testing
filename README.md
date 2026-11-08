# Software-Testing
All the work done in the course **CSSE 604 Software Testing** (Morning Program 2026).

| Folder | Contents |
|---|---|
| [`QA-Report/`](QA-Report/) | Quality assurance bug report — Word + PDF in `output/`, generated from `report-data.json` |
| [`QC-Report/`](QC-Report/) | Quality control report and mini/macro simulation video |
| [`Assignments/`](Assignments/) | Course assignments |
| [`CHANGELOG.md`](CHANGELOG.md) | Every change, step by step |

## QA report — how to update
1. Fill in `QA-Report/report-data.json` (student details, application, environments, features, tools, links) and add one entry per bug to `bugs`.
2. Put screenshots in `QA-Report/screenshots/` and list their file names in the bug's `screenshots` field.
3. Mark the techniques you used in `QA-Report/techniques.json` (`"applied": true`).
4. Run `./QA-Report/build.sh` → `QA-Report/output/<seat>_<name>_QA.docx` and `.pdf`.

Anything still marked `[PLACEHOLDER: ...]` is highlighted yellow in the Word file.

Earlier versions of the report are kept in [`QA-Report/versions/`](QA-Report/versions/), one PDF per milestone.
