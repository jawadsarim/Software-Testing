# Changelog

Every change to this repo, newest first, so the history shows how the work was built step by step. Each entry matches one commit.

## 2026-11-09

### 12. QA report: 100 bugs
- Logged BUG-079 to BUG-100 (3 High, 37 Medium, 60 Low in total) from a read-only crawl of all 211 pages in the site's sitemap and checks of Easy Own, Hyundai Promise, the Feedback form, price lists, legal pages, genuine-parts pages and press releases
- Main finds: SONATA 2.5 instalment figures wrong, WordPress sample page and a test page published, a page redirecting to the developer's staging server, conflicting phone numbers on a used-car listing
- Version snapshot v6 in `QA-Report/versions/`

### 11. QA report: 78 bugs, all 100 techniques applied
- Logged BUG-062 to BUG-078 (3 High, 31 Medium, 44 Low in total): keyboard focus, site search, Sitemap link, dealer list for cities without a dealer, mobile field accepting "e", form data lost on refresh, language and price formats, cookie flags, resume upload, cut-off captions, heading structure, image alt text, click-to-call and autocomplete
- Techniques that cannot be applied lawfully or meaningfully to a live site (attacks, load testing, code-level testing, login testing on a site without a login) replaced with 20 techniques that were applied, such as redirects, 404 page, sitemap and robots.txt, back/forward navigation and HTML checks
- Techniques applied without finding a defect now show the result in Appendix C
- Layout: each bug's report on one page and its screenshots on the next page
- Version snapshot v5 in `QA-Report/versions/`

### 10. QA report: 61 bugs (Booking Status, Find a Dealer, Online Booking)
- Logged BUG-051 to BUG-061 (3 High, 27 Medium, 31 Low in total): Booking Status input validation and text, dealer phone formats and map location, missing Rawalpindi in the Test Drive city list, no confirmation after Online Booking submit, 12-digit mobile number accepted
- 57 of 100 techniques applied
- Version snapshot v4 in `QA-Report/versions/`

### 9. Cross-browser testing complete
- Test environment ENV-3 filled in: Microsoft Edge 157.0.4341.42 on Windows 11 Home 26H2 (build 26300.9818)
- Edge results: pages, menus, forms and downloads behave as in Chrome; press-release images load correctly
- Report has no placeholders left

## 2026-11-08

### 8. QA report: 50 bugs, security, performance and cross-browser testing
- Logged BUG-013 to BUG-050 (2 High, 23 Medium, 25 Low in total): Book a Service, Test Drive and Brochure pages, owner's manual downloads, security headers, SSL, Lighthouse performance and accessibility
- Added test environment ENV-3 (Microsoft Edge) and cross-browser results
- Added tools (securityheaders.com, SSL Labs) and the OWASP CSP link; 55 of 100 techniques applied
- Version snapshot v3 in `QA-Report/versions/`

### 7. QA report: first 12 bugs and completed details
- Logged BUG-001 to BUG-012 (1 High, 4 Medium, 7 Low) with steps, expected and actual results, oracle and cropped screenshots
- Test environments: HP Laptop 15s-fq2xxx on Windows 11 Home (ENV-1) and Chrome DevTools phone view (ENV-2)
- Filled the application description, tools used, own technique (Desktop–Mobile Parity Check) and helpful links
- Removed the submission date and testing period; larger screenshots on bug pages
- New `QA-Report/versions/` folder with a PDF snapshot of each report milestone (v1, v2)

### 6. Tidy repo: remove internal notes, clean file metadata
- Removed the internal maintenance-notes file
- Cleared tool metadata from the Assignment 01 Word file

### 5. Add Assignment 01: Quality Engineering & Business Statistics
- Added `Assignments/01-quality-engineering-business-statistics/` with the report (PDF + Word) and the course's Testing framework image
- Report byline set to Syed Sarim Jawad Zaidi (B22110106080)
- Listed the assignment in `Assignments/README.md`; added this changelog

### 4. Maintenance notes: commands and push routine
- Commands written for VS Code's PowerShell terminal on Windows
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
- README and `.gitignore`
