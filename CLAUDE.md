# Software-Testing repo — maintenance guide

Sarim's coursework repo for **CSSE 604 Software Testing (Morning Program 2026)**. Everything done in the course lives here: the QA report, the QC report, and all assignments.

## Rules
- **Never commit or push.** Sarim commits and pushes himself so his GitHub contribution chart reflects his own schedule. Prepare changes in the working tree, then tell him what changed. If he asks for a commit, he will say so explicitly.
- **Never throw work away.** Every change gets an entry in `CHANGELOG.md` (newest first, one entry per commit) so the history shows each step. Don't delete or silently overwrite files; git history keeps earlier versions, so no duplicate draft copies are needed.
- **Pushing:** when Sarim says he wants to push, give him step-by-step commands, one commit per CHANGELOG entry, oldest first.
- Keep the structure below and the repo clean: no stray files, build output only in `QA-Report/output/`. New coursework goes into `Assignments/` in its own numbered folder (`Assignments/03-<short-name>/`), with the brief and the submission side by side.
- Submission file names follow the instructor's convention: `<complete seat number>_<Name>_<QA|QC|QM>` — both `.docx` and `.pdf`.

## Structure
| Path | What it holds |
|---|---|
| `QA-Report/` | QA bug report: data in `report-data.json` + `techniques.json`, built by `build.sh` into `output/` |
| `QC-Report/` | QC report and the mini/macro simulation video |
| `Assignments/` | All other course assignments |

## QA report requirements (from the instructor)
- Standard defect report templates from the Lewis book; **one bug per page**.
- Each bug: Title, ID, Severity, reproducible steps, screenshots, environment details, and the **oracle** (why it is a bug).
- Apply at least 100 testing techniques and list them at the end.
- Appendix: features list, tools used, techniques used or created, helpful internet links.
- Report must have: teacher acknowledgement, table of contents, header and footer, graphs, workflow diagrams.
- Marked on both quality and quantity of bugs, with high-severity bugs valued. Individual work — similar reports get zero.

## Building the QA report
```bash
./QA-Report/build.sh
```
Needs Node.js with `docx`, Python 3 with `matplotlib` and `pillow`, Mermaid CLI (`mmdc`), and LibreOffice for the PDF. Everything still marked `[PLACEHOLDER: ...]` is highlighted yellow in the Word file — the report is not ready to submit until none remain.
