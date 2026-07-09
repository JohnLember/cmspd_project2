import loretoSeal from "../assets/loreto_seal.jpg";

// Age brackets used by the PDAO "Summary of PWD Age Profile" form.
const BRACKETS = ["children", "youth", "adult", "senior"];

const ageFrom = (birthdate) => {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
};

const bracketFor = (age) => {
  if (age == null) return null;
  if (age <= 18) return "children";
  if (age <= 30) return "youth";
  if (age <= 59) return "adult";
  return "senior";
};

const emptyBrackets = () => ({
  children: { m: 0, f: 0 },
  youth: { m: 0, f: 0 },
  adult: { m: 0, f: 0 },
  senior: { m: 0, f: 0 },
});

// Load an imported image URL as a data URL so jsPDF can embed it.
const toDataUrl = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Aggregate profiles into per-barangay age/sex counts.
export function buildAgeProfile(profiles) {
  const byBarangay = {};
  profiles.forEach((p) => {
    const barangay = (p.barangay || "").trim() || "Unspecified";
    byBarangay[barangay] ??= emptyBrackets();
    const bracket = bracketFor(ageFrom(p.birthdate));
    if (!bracket) return;
    const sex = (p.sex || "").toLowerCase();
    if (sex === "male") byBarangay[barangay][bracket].m += 1;
    else if (sex === "female") byBarangay[barangay][bracket].f += 1;
  });
  return Object.keys(byBarangay)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, ...byBarangay[name] }));
}

// Build one barangay's row cells + running totals accumulator.
const rowCells = (row) => {
  const cells = [];
  let wwd = 0;
  let overall = 0;
  BRACKETS.forEach((b) => {
    const { m, f } = row[b];
    const total = m + f;
    cells.push(m, f, total);
    wwd += f;
    overall += total;
  });
  cells.push(wwd, overall);
  return { cells, wwd, overall };
};

export async function exportAgeProfilePdf(profiles, scopeText = "") {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const rows = buildAgeProfile(profiles);
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // ---- Header: logo + republic block centered together (logo beside text) ----
  let sealData = null;
  try {
    sealData = await toDataUrl(loretoSeal);
  } catch {
    // header still renders without the seal
  }

  // Measure the widest republic line so we can centre logo + text as one group.
  doc.setFontSize(11);
  const repLines = [
    { text: "Republic of the Philippines", font: "normal" },
    { text: "PROVINCE OF AGUSAN DEL SUR", font: "bold" },
    { text: "Municipality of Loreto", font: "bold" },
  ];
  let maxTextW = 0;
  repLines.forEach((l) => {
    doc.setFont("helvetica", l.font);
    maxTextW = Math.max(maxTextW, doc.getTextWidth(l.text));
  });

  // Text stays centered on the page; the logo sits just left of the text block.
  const logoW = 52;
  const gap = 14;
  const logoX = centerX - maxTextW / 2 - gap - logoW;

  if (sealData) {
    doc.addImage(sealData, "JPEG", logoX, 26, logoW, logoW);
  }

  doc.setFont("helvetica", "normal");
  doc.text("Republic of the Philippines", centerX, 40, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("PROVINCE OF AGUSAN DEL SUR", centerX, 55, { align: "center" });
  doc.text("Municipality of Loreto", centerX, 70, { align: "center" });

  doc.setFontSize(12);
  doc.text("Persons with Disability Affairs Office (PDAO)", centerX, 95, {
    align: "center",
  });
  doc.text("SUMMARY OF PWD AGE PROFILE", centerX, 111, { align: "center" });

  const asOf = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  doc.setTextColor(200, 30, 30);
  doc.setFontSize(11);
  doc.text(`As of ${asOf}`, centerX, 127, { align: "center" });
  doc.setTextColor(0, 0, 0);

  // Optional filter scope (barangay / disability) chosen in the export modal.
  if (scopeText) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(scopeText, centerX, 140, { align: "center" });
    doc.setFont("helvetica", "normal");
  }
  const tableStartY = scopeText ? 152 : 140;

  // ---- Table ----
  const head = [
    [
      { content: "BARANGAY", rowSpan: 3, styles: { valign: "middle", halign: "center" } },
      {
        content: "PERSON WITH DISABILITY AT THE AGE OF...",
        colSpan: 12,
        styles: { halign: "center", fillColor: [214, 203, 160] },
      },
      { content: "NO. OF WOMEN'S WITH DISABILITY (WWD)", rowSpan: 3, styles: { valign: "middle", halign: "center" } },
      { content: "OVERALL TOTAL", rowSpan: 3, styles: { valign: "middle", halign: "center", fillColor: [224, 123, 90], textColor: [255, 255, 255] } },
      { content: "REMARKS", rowSpan: 3, styles: { valign: "middle", halign: "center", fillColor: [247, 208, 96] } },
    ],
    [
      { content: "NO. OF CHILDREN WITH DISABILITY (18 YRS. OLD AND BELOW)", colSpan: 3, styles: { halign: "center", fillColor: [197, 217, 232] } },
      { content: "NO. OF YOUTH WITH DISABILITY (19-30 YRS OLD)", colSpan: 3, styles: { halign: "center", fillColor: [196, 215, 155] } },
      { content: "NO. OF PWD AGED 31-59 YEARS OLD", colSpan: 3, styles: { halign: "center", fillColor: [235, 235, 235] } },
      { content: "NO. OF PWD AGED 60 YEARS OLD AND ABOVE", colSpan: 3, styles: { halign: "center", fillColor: [217, 217, 217] } },
    ],
    [
      { content: "M", styles: { halign: "center" } },
      { content: "F", styles: { halign: "center" } },
      { content: "Total", styles: { halign: "center", fillColor: [255, 235, 130] } },
      { content: "M", styles: { halign: "center" } },
      { content: "F", styles: { halign: "center" } },
      { content: "Total", styles: { halign: "center", fillColor: [255, 235, 130] } },
      { content: "M", styles: { halign: "center" } },
      { content: "F", styles: { halign: "center" } },
      { content: "Total", styles: { halign: "center", fillColor: [255, 235, 130] } },
      { content: "M", styles: { halign: "center" } },
      { content: "F", styles: { halign: "center" } },
      { content: "Total", styles: { halign: "center", fillColor: [255, 235, 130] } },
    ],
  ];

  const remarksText =
    "The registered PWD who were already deceased and transferred in another municipality are no longer included in the total population of PWD of Loreto, Agusan del Sur.";

  const totals = { ...emptyBrackets() };
  const body = [];
  rows.forEach((row, i) => {
    const { cells } = rowCells(row);
    BRACKETS.forEach((b) => {
      totals[b].m += row[b].m;
      totals[b].f += row[b].f;
    });
    const line = [row.name, ...cells];
    if (i === 0) {
      line.push({
        content: remarksText,
        rowSpan: rows.length + 1, // spans all barangay rows + the total row
        styles: { valign: "middle", halign: "center", fillColor: [247, 208, 96], fontStyle: "italic" },
      });
    }
    body.push(line);
  });

  // Municipality total row.
  const totalRow = rowCells(totals);
  body.push([
    { content: "LORETO (TOTAL)", styles: { fontStyle: "bold" } },
    ...totalRow.cells,
  ]);

  // Two width tiers: Barangay, WWD, Overall Total and Remarks share the wider
  // width; the 12 age-bracket columns (M/F/Total × 4) are narrower.
  const COL_W = 48;
  const AGE_W = 24;
  const WIDE_W = 58; // Barangay, Overall Total and Remarks (a bit wider)
  const YELLOW = [255, 244, 176];
  const columnStyles = {};
  for (let c = 0; c <= 15; c += 1) {
    columnStyles[c] = { cellWidth: c >= 1 && c <= 12 ? AGE_W : COL_W };
  }
  columnStyles[0].cellWidth = WIDE_W;
  columnStyles[0].halign = "left";
  columnStyles[0].fontStyle = "bold";
  [3, 6, 9, 12].forEach((c) => {
    columnStyles[c].fillColor = YELLOW;
  });
  columnStyles[14].cellWidth = WIDE_W;
  columnStyles[14].fillColor = [224, 123, 90];
  columnStyles[14].textColor = [255, 255, 255];
  columnStyles[14].fontStyle = "bold";
  columnStyles[15].cellWidth = WIDE_W;
  columnStyles[15].fillColor = [247, 208, 96];

  // Centre the table on the page.
  const tableW = WIDE_W * 3 + COL_W + AGE_W * 12;
  const sideMargin = Math.max(18, (pageWidth - tableW) / 2);

  autoTable(doc, {
    head,
    body,
    startY: tableStartY,
    theme: "grid",
    margin: { left: sideMargin, right: sideMargin },
    tableWidth: "auto",
    styles: { fontSize: 10, cellPadding: 2, halign: "center", valign: "middle", overflow: "linebreak", lineColor: [120, 120, 120], lineWidth: 0.5 },
    headStyles: { fontSize: 9, fontStyle: "bold", textColor: [0, 0, 0], fillColor: [235, 235, 235] },
    columnStyles,
    // Emphasise the LORETO (TOTAL) row (leave the merged Remarks cell as-is).
    didParseCell: (data) => {
      const isTotalRow = data.section === "body" && data.row.index === body.length - 1;
      if (isTotalRow && data.column.index !== 15) {
        data.cell.styles.fillColor = [224, 123, 90];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const slug = new Date().toISOString().slice(0, 7);
  doc.save(`pwd-age-profile-${slug}.pdf`);
}
