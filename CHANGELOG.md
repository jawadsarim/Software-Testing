# Changelog

Every change to this repo, newest first, so the history shows how the work was built step by step. Each entry matches one commit.

## 2026-11-08

### 5. Add Assignment 01: Quality Engineering & Business Statistics
- Added `Assignments/01-quality-engineering-business-statistics/` with the report (PDF + Word) and the course's Testing framework image
- Report byline set to Syed Sarim Jawad Zaidi (B22110106080)
- Listed the assignment in `Assignments/README.md`; added this changelog

### 4. Maintenance guide: commands and push routine
- `CLAUDE.md`: commands are written for VS Code's PowerShell terminal on Windows
- Push right after every commit; finish each push session with cleanup commands

### 3. QA report: application, student details, environment, features
- Application under test: Hyundai Nishat Motors website (hyundai-nishat.com)
- Name, seat number, email, WhatsApp number, department and university, instructor (Sir Hussain Saleem)
- Test environment ENV-1 (Windows 11, Chrome 156, 1920×1080) and the site's 20 features in Appendix A
- Generated `B22110106080_Syed_Sarim_Jawad_Zaidi_QA` (.docx + .pdf)

### 2. QA report template and build pipeline
- `techniques.json` (100-technique checklist), Mermaid diagrams, `build.sh` and scripts that build the Word and PDF files
- Report layout: title page, teacher acknowledgement, table of contents, header and footer, testing-workflow and bug-life-cycle diagrams, severity and module graphs, one page per bug (Lewis template with oracle), appendix

## 2026-11-07

### 1. Repo structure
- Folders: `QA-Report/`, `QC-Report/`, `Assignments/`
- README, maintenance guide (`CLAUDE.md`), `.gitignore`
