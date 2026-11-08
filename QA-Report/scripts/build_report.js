// Builds the QA bug report (.docx) from report-data.json + techniques.json.
// Run via ./QA-Report/build.sh (which also renders diagrams, charts and the PDF).
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, ImageRun,
  Header, Footer, PageNumber, TableOfContents, LevelFormat, VerticalAlign, ExternalHyperlink,
} = require("docx");

const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "report-data.json"), "utf8"));
const techData = JSON.parse(fs.readFileSync(path.join(ROOT, "techniques.json"), "utf8"));
const { student, course, application: app, environments, features, tools, links, bugs } = data;

// ---------- layout constants (A4, 1" margins) ----------
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN; // 9026
const FONT = "Arial";
const ACCENT = "1F3A5F";
const SEV_FILL = { Critical: "F8D7D5", High: "FDE2CF", Medium: "FBF0C9", Low: "DCE8F3" };
const border = { style: BorderStyle.SINGLE, size: 4, color: "B8C2CC" };
const borders = { top: border, bottom: border, left: border, right: border };

// ---------- helpers ----------
const isPh = (s) => typeof s === "string" && s.includes("[PLACEHOLDER");
// Text runs; placeholder text is highlighted so nothing unfinished slips into the final file.
function runs(text, opts = {}) {
  return String(text ?? "").split(/(\[PLACEHOLDER[^\]]*\])/).filter((s) => s !== "")
    .map((s) => new TextRun({ text: s, font: FONT, ...opts, ...(isPh(s) ? { highlight: "yellow" } : {}) }));
}
const P = (text, opts = {}, pOpts = {}) => new Paragraph({ children: runs(text, opts), spacing: { after: 120, line: 300 }, ...pOpts });
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs(text) });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(text) });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const bullet = (text) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: runs(text), spacing: { after: 60 } });

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), buf: b };
}
function image(file, maxW = 600, maxH = 700) {
  const { w, h, buf } = pngSize(file);
  const scale = Math.min(maxW / w, maxH / h, 1e9);
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 },
    children: [new ImageRun({ type: "png", data: buf, transformation: { width: Math.round(w * scale), height: Math.round(h * scale) } })],
  });
}
const caption = (text) => P(text, { italics: true, size: 18, color: "555555" }, { alignment: AlignmentType.CENTER, spacing: { after: 240 } });

function cell(content, width, { fill, bold, header } = {}) {
  const children = Array.isArray(content) ? content : [new Paragraph({ children: runs(content, { bold: bold || header, size: 20, color: header ? "FFFFFF" : undefined }) })];
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: header ? { fill: ACCENT, type: ShadingType.CLEAR, color: "auto" } : fill ? { fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, children,
  });
}
function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      ...(headers ? [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], { header: true })) })] : []),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => (c instanceof TableCell ? c : cell(c, widths[i]))) })),
    ],
  });
}
const spacer = () => new Paragraph({ children: [], spacing: { after: 120 } });

// ---------- derived data ----------
const envById = Object.fromEntries(environments.map((e) => [e.id, e]));
const envText = (id) => { const e = envById[id]; return e ? `${e.id}: ${e.device}, ${e.os}, ${e.browser}, ${e.screen}, ${e.network}` : id; };
const techniques = techData.techniques.map((t) => {
  const ids = bugs.filter((b) => (b.technique || "").toLowerCase().includes(t.name.toLowerCase())).map((b) => b.id);
  return { ...t, bugIds: ids, applied: t.applied || ids.length > 0 };
});
const appliedCount = techniques.filter((t) => t.applied).length;
const sevOrder = ["Critical", "High", "Medium", "Low"];
const sevCount = Object.fromEntries(sevOrder.map((s) => [s, bugs.filter((b) => b.severity === s).length]));

// ---------- title page ----------
const titlePage = [
  new Paragraph({ spacing: { before: 1400 }, alignment: AlignmentType.CENTER, children: runs(student.university, { size: 28, bold: true, color: ACCENT }) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: runs(`${course.code} — ${course.title}  |  ${course.program}`, { size: 24 }) }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: runs("Quality Assurance Report", { size: 52, bold: true, color: ACCENT }) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: runs("Software Bug Report", { size: 32 }) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1000 }, children: [...runs("Application under test: ", { size: 26 }), ...runs(app.name, { size: 26, bold: true })] }),
  table(null, [
    ["Submitted by", student.name], ["Seat number", student.seat_number], ["Email ID", student.email],
    ["Contact number", student.contact], ["Submitted to", course.instructor],
  ].map(([k, v]) => [cell(k, 3000, { fill: "EEF2F6", bold: true }), cell(v, 5000)]), [3000, 5000]),
];

// ---------- front matter ----------
const front = [
  H1("Acknowledgement"),
  P(`I would like to express my sincere gratitude to my respected teacher, ${course.instructor}, for the guidance, encouragement and practical knowledge shared throughout the ${course.code} ${course.title} course. The emphasis on testing real applications rigorously, rather than only studying the theory, shaped the way this assignment was approached.`),
  P("The instructions on standard bug-report formats, testing techniques and report structure made it possible to carry out this assignment as a real-world quality assurance exercise. I am also thankful to my classmates and mentors for their support during the testing period."),
  new Paragraph({ spacing: { before: 480 }, children: runs(student.name, { bold: true }) }),
  P(student.seat_number),
  pageBreak(),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs("Table of Contents") }),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  pageBreak(),
];

// ---------- body ----------
const body = [
  H1("1. Introduction"),
  H2("1.1 Purpose"),
  P(`This report documents the defects found while testing ${isPh(app.name) ? "the selected application" : app.name} as part of the ${course.code} ${course.title} quality assurance assignment. Each defect is recorded on its own page using the standard defect report format from the Lewis textbook, with its severity, reproducible steps, screenshots, environment details and the oracle explaining why it is a bug.`),
  H2("1.2 Application under test"),
  table(null, [
    ["Application", app.name], ["Type", app.type], ["URL / version", app.url_or_version],
  ].map(([k, v]) => [cell(k, 2600, { fill: "EEF2F6", bold: true }), cell(v, CONTENT_W - 2600)]), [2600, CONTENT_W - 2600]),
  spacer(),
  P(app.description),
  H2("1.3 Scope"),
  P(`Testing covered the application's features listed in Appendix A. A total of ${appliedCount} testing techniques were applied (Appendix C), spanning functional, test-design, UI and usability, cross-browser and responsiveness, performance and security testing.`),

  H1("2. Test Environment"),
  P("All bugs were found and reproduced on the environments below. Each bug report refers to one of these by its ID."),
  table(["ID", "Device", "OS", "Browser", "Screen", "Network"],
    environments.map((e) => [e.id, e.device, e.os, e.browser, e.screen, e.network]),
    [900, 1900, 1600, 1700, 1400, 1526]),

  H1("3. Testing Approach and Workflow"),
  H2("3.1 Testing workflow"),
  P("Testing followed the workflow below: features were analysed first, techniques were selected according to the diagnosis of likely malfunctions, and every defect found was logged, classified and retested."),
  image(path.join(BUILD, "testing-workflow.png"), 600, 360),
  caption("Figure 1: Testing workflow followed in this assignment"),
  H2("3.2 Bug life cycle"),
  image(path.join(BUILD, "bug-lifecycle.png"), 600, 260),
  caption("Figure 2: Bug life cycle"),
  H2("3.3 Severity definitions"),
  table(["Severity", "Meaning"], [
    [cell("Critical", 1800, { fill: SEV_FILL.Critical, bold: true }), "Crash, data loss, security breach, or a core feature completely unusable with no workaround."],
    [cell("High", 1800, { fill: SEV_FILL.High, bold: true }), "A major feature behaves incorrectly or blocks a key user task; a workaround is difficult."],
    [cell("Medium", 1800, { fill: SEV_FILL.Medium, bold: true }), "Feature works partly or incorrectly in some cases; a reasonable workaround exists."],
    [cell("Low", 1800, { fill: SEV_FILL.Low, bold: true }), "Cosmetic, spelling, alignment or minor usability issue that does not affect functionality."],
  ], [1800, CONTENT_W - 1800]),

  H1("4. Bug Summary"),
  P(`A total of ${bugs.length} bug(s) were identified: ${sevOrder.map((s) => `${sevCount[s]} ${s}`).join(", ")}.`),
  table(["Bug ID", "Title", "Module", "Severity"],
    bugs.map((b) => [b.id, b.title, b.module, cell(b.severity, 1300, { fill: SEV_FILL[b.severity], bold: true })]),
    [1200, 4526, 2000, 1300]),
  spacer(),
  image(path.join(BUILD, "chart-severity.png"), 560, 300),
  caption("Figure 3: Distribution of bugs by severity"),
  image(path.join(BUILD, "chart-module.png"), 560, 320),
  caption("Figure 4: Distribution of bugs by module"),

  pageBreak(),
  H1("5. Bug Reports"),
  P("Each bug below is reported on a separate page using the standard defect report template."),
];

// ---------- one page per bug ----------
const L = 2600, R = CONTENT_W - L;
const field = (k, v, opts = {}) => [cell(k, L, { fill: "EEF2F6", bold: true }), opts.cell || cell(v, R, opts)];
bugs.forEach((b, i) => {
  if (i > 0) body.push(pageBreak());
  body.push(H2(`${b.id}: ${b.title}`));
  body.push(table(null, [
    field("Bug ID", b.id), field("Title", b.title), field("Module / feature", b.module),
    field("Severity", b.severity, { fill: SEV_FILL[b.severity], bold: true }), field("Priority", b.priority),
    field("Status", b.status), field("Date found", b.date_found), field("Reported by", `${student.name} (${student.seat_number})`),
    field("Environment", envText(b.environment)), field("Technique(s) used", b.technique), field("Reproducibility", b.reproducibility),
  ], [L, R]));
  body.push(spacer());
  const block = (title, text) => { body.push(P(title, { bold: true, color: ACCENT }, { spacing: { before: 120, after: 60 } })); body.push(P(text)); };
  block("Description", b.description);
  block("Preconditions", b.preconditions);
  body.push(P("Steps to reproduce", { bold: true, color: ACCENT }, { spacing: { before: 120, after: 60 } }));
  b.steps.forEach((s) => body.push(new Paragraph({ numbering: { reference: `steps-${b.id}`, level: 0 }, children: runs(s), spacing: { after: 60 } })));
  block("Test data", b.test_data);
  block("Expected result", b.expected);
  block("Actual result", b.actual);
  block("Oracle (why this is a bug)", b.oracle);
  body.push(P("Screenshots", { bold: true, color: ACCENT }, { spacing: { before: 120, after: 60 } }));
  if (b.screenshots && b.screenshots.length) {
    b.screenshots.forEach((s, i) => {
      const f = path.join(BUILD, "screenshots", path.parse(s).name + ".png");
      if (fs.existsSync(f)) { body.push(image(f, 600, 560)); body.push(caption(`${b.id} — Screenshot ${i + 1}`)); }
      else body.push(P(`[PLACEHOLDER: screenshot ${s} not found in QA-Report/screenshots]`));
    });
  } else {
    body.push(table(null, [[cell([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500, after: 500 }, children: runs("[PLACEHOLDER: Add screenshot file names to this bug's \"screenshots\" list]") })], CONTENT_W, { fill: "F7F7F7" })]], [CONTENT_W]));
  }
});

// ---------- appendix ----------
const appendix = [
  pageBreak(),
  H1("Appendix"),
  H2("A. Features List of the Application"),
  ...features.map(bullet),
  H2("B. Tools Used to Find the Bugs"),
  table(["#", "Tool", "Purpose"], tools.map((t, i) => [String(i + 1), t.name, t.purpose]), [600, 2800, CONTENT_W - 3400]),
  H2("C. Testing Techniques Used"),
  P(`${appliedCount} of the ${techniques.length} techniques below were applied. Applied techniques are marked ✔ with the bugs they uncovered.`),
  table(["#", "Technique", "Category", "Applied", "Bug IDs"],
    techniques.map((t, i) => [String(i + 1), t.name, t.category,
      cell(t.applied ? "✔" : "—", 1100, { fill: t.applied ? "DFF0D8" : undefined, bold: t.applied }), t.bugIds.join(", ")]),
    [600, 3500, 2226, 1100, 1600]),
  spacer(),
  P("Techniques created or adapted for this assignment:", { bold: true }),
  ...data.custom_techniques.map(bullet),
  H2("D. Helpful Internet Links"),
  ...links.map((l) => isPh(l.url)
    ? bullet(`${l.title} — ${l.url}`)
    : new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [
        ...runs(`${l.title} — `), new ExternalHyperlink({ link: l.url, children: [new TextRun({ text: l.url, font: FONT, style: "Hyperlink" })] })] })),
];

// ---------- document ----------
const numbering = {
  config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ...bugs.map((b) => ({ reference: `steps-${b.id}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] })),
  ],
};
const header = new Header({ children: [new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
  children: [...runs(`${course.code} ${course.title} — QA Bug Report`, { size: 16, color: "555555" }), new TextRun({ text: "\t", font: FONT }), ...runs(student.seat_number, { size: 16, color: "555555" })],
  tabStops: [{ type: "right", position: CONTENT_W }],
})] });
const footer = new Footer({ children: [new Paragraph({
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
  tabStops: [{ type: "right", position: CONTENT_W }],
  children: [...runs(student.name, { size: 16, color: "555555" }), new TextRun({ text: "\tPage ", font: FONT, size: 16, color: "555555" }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "555555" }),
    new TextRun({ text: " of ", font: FONT, size: 16, color: "555555" }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: "555555" })],
})] });
const page = { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } };

const doc = new Document({
  creator: student.name, title: `${course.code} QA Bug Report — ${app.name}`,
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 32, bold: true, color: ACCENT }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 26, bold: true, color: ACCENT }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering,
  sections: [
    { properties: { page }, children: titlePage },
    { properties: { page }, headers: { default: header }, footers: { default: footer }, children: [...front, ...body, ...appendix] },
  ],
});

const fileBase = `${isPh(student.seat_number) ? "SEATNUMBER" : student.seat_number}_${isPh(student.name) ? "NAME" : student.name.replace(/\s+/g, "_")}_QA`;
fs.mkdirSync(path.join(ROOT, "output"), { recursive: true });
const outFile = path.join(ROOT, "output", `${fileBase}.docx`);
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(outFile, buf); console.log(outFile); });
