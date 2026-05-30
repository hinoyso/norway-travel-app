import ExcelJS from "exceljs";
import { ExcelRow, ParsedItinerary } from "@/lib/types";
import { format, parse, isValid } from "date-fns";

// Standard field mappings
const COLUMN_MAP: Record<string, string> = {
  // English
  date: "date", "day number": "day_number", "day #": "day_number", day: "day_number",
  city: "city", "activity name": "activity_name", activity: "activity_name", name: "activity_name",
  description: "description", desc: "description",
  "start time": "start_time", start: "start_time",
  "end time": "end_time", end: "end_time",
  address: "address", location: "address",
  notes: "notes", note: "notes", remarks: "notes",
  // Hebrew — standard fields
  "תאריך": "date",
  "עיר": "city",
  "תיאור": "activity_name",
  "נקודות עצירה": "description",
  "יום מס'": "day_number",
  "מלון": "address",
  // Hebrew — extra info stored as structured JSON in notes
  "מסעדה": "notes_restaurant",
  "מרחק נסיעה": "notes_driving",
  'מרחק ק"מ': "notes_km",
};

function normalizeHeader(header: string): string {
  return String(header).toLowerCase().trim();
}

function parseExcelDate(value: ExcelJS.CellValue): string {
  if (value instanceof Date) return format(value, "yyyy-MM-dd");
  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return format(date, "yyyy-MM-dd");
  }
  if (typeof value === "string") {
    const fmts = ["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "d MMM yyyy", "MMMM d, yyyy", "d/M/yyyy"];
    for (const fmt of fmts) {
      const parsed = parse(value, fmt, new Date());
      if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
    }
  }
  return String(value ?? "");
}

function parseTime(value: ExcelJS.CellValue): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (value instanceof Date) return format(value, "HH:mm");
  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const str = String(value).trim();
  if (/^\d{1,2}:\d{2}/.test(str)) {
    const [h, m] = str.split(":");
    return `${String(parseInt(h)).padStart(2, "0")}:${m.slice(0, 2).padStart(2, "0")}`;
  }
  return str || undefined;
}

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "richText" in (v as object)) {
    return (v as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join("");
  }
  if (typeof v === "object" && "text" in (v as object)) {
    return String((v as ExcelJS.CellHyperlinkValue).text);
  }
  return String(v);
}

export async function parseExcelBuffer(
  buffer: ArrayBuffer,
  tripName?: string
): Promise<ParsedItinerary> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("Excel file has no worksheets.");

  const sheetName = worksheet.name;

  // Scan first 50 rows to find the header row
  let headerRowNumber = 1;
  let fieldMap: Record<number, string> = {};

  for (let r = 1; r <= 50; r++) {
    const candidate = worksheet.getRow(r);
    const candidateMap: Record<number, string> = {};
    candidate.eachCell((cell, colNumber) => {
      const normalized = normalizeHeader(cellText(cell));
      const key = COLUMN_MAP[normalized];
      if (key) candidateMap[colNumber] = key;
    });
    if (Object.keys(candidateMap).length >= 2) {
      headerRowNumber = r;
      fieldMap = candidateMap;
      break;
    }
  }

  const headerRow = worksheet.getRow(headerRowNumber);
  const mappedFields = Object.values(fieldMap);
  const requiredFields = ["date", "city", "activity_name"];
  const missing = requiredFields.filter((f) => !mappedFields.includes(f));
  if (missing.length > 0) {
    const foundHeaders: string[] = [];
    headerRow.eachCell((cell) => foundHeaders.push(cellText(cell)));
    throw new Error(`Missing required columns: ${missing.join(", ")}. Found: ${foundHeaders.join(", ")}`);
  }

  const rows: ExcelRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNumber) return;
    const record: Partial<ExcelRow> & { _extra?: Record<string, string> } = {};
    let hasData = false;

    for (const [colIdx, field] of Object.entries(fieldMap)) {
      const cell = row.getCell(parseInt(colIdx));
      const value = cell.value;
      if (value !== null && value !== undefined && value !== "") hasData = true;

      if (field === "date") {
        record.date = parseExcelDate(value);
      } else if (field === "start_time" || field === "end_time") {
        (record as Record<string, unknown>)[field] = parseTime(value);
      } else if (field === "day_number") {
        record.day_number = parseInt(String(value ?? "0")) || 0;
      } else if (field.startsWith("notes_")) {
        // Store structured extra columns — serialised as JSON into the notes field
        const key = field.slice(6); // e.g. "restaurant", "driving", "km"
        const newVal = cellText(cell).trim();
        if (newVal) {
          if (!record._extra) record._extra = {};
          record._extra[key] = newVal;
        }
      } else {
        (record as Record<string, unknown>)[field] = cellText(cell).trim();
      }
    }

    if (!hasData) return;
    if (record.date && record.city) {
      if (!record.activity_name) record.activity_name = record.city;
      // Serialise structured extra data to notes as JSON
      if (record._extra && Object.keys(record._extra).length > 0) {
        record.notes = JSON.stringify(record._extra);
      }
      delete record._extra;
      rows.push(record as ExcelRow);
    }
  });

  if (rows.length === 0) throw new Error("No valid rows found in the Excel file.");

  return {
    trip_name: tripName || sheetName || "Norway Trip",
    rows,
  };
}
