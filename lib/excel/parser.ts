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
    // Pull a date-looking token out of strings like "יום שישי 20/06/2025"
    const cleaned = value.trim();
    const tokenMatch = cleaned.match(/\d{1,4}[.\/-]\d{1,2}[.\/-]\d{1,4}|\d{4}-\d{2}-\d{2}/);
    const candidate = tokenMatch ? tokenMatch[0] : cleaned;
    const fmts = [
      "yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy", "MM/dd/yyyy",
      "dd.MM.yyyy", "d.M.yyyy", "dd.MM.yy", "d.M.yy",
      "dd-MM-yyyy", "d-M-yyyy", "yyyy/MM/dd",
      "d MMM yyyy", "MMMM d, yyyy",
    ];
    for (const fmt of fmts) {
      const parsed = parse(candidate, fmt, new Date());
      if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
    }
  }
  // Could not parse → empty so the caller can fall back to the previous row's date
  return "";
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

  // Carry-forward values for blank (merged) cells
  let lastDate = "";
  let lastCity = "";
  let lastDayNumber = 0;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNumber) return;

    let date = "";
    let city = "";
    let dayNumber = 0;
    let activityName = "";
    let description = "";
    let address = "";
    let startTime: string | undefined;
    let endTime: string | undefined;
    const extra: Record<string, string> = {};
    let hasData = false;

    for (const [colIdx, field] of Object.entries(fieldMap)) {
      const cell = row.getCell(parseInt(colIdx));
      const value = cell.value;
      if (value !== null && value !== undefined && value !== "") hasData = true;

      if (field === "date") {
        date = parseExcelDate(value);
      } else if (field === "start_time") {
        startTime = parseTime(value);
      } else if (field === "end_time") {
        endTime = parseTime(value);
      } else if (field === "day_number") {
        dayNumber = parseInt(String(value ?? "0")) || 0;
      } else if (field === "city") {
        city = cellText(cell).trim();
      } else if (field === "activity_name") {
        activityName = cellText(cell).trim();
      } else if (field === "description") {
        description = cellText(cell).trim();
      } else if (field === "address") {
        address = cellText(cell).trim();
      } else if (field.startsWith("notes_")) {
        const key = field.slice(6); // "restaurant" | "driving" | "km"
        const v = cellText(cell).trim();
        if (v) extra[key] = v;
      }
    }

    if (!hasData) return;

    // Fill down merged/blank date + city + day number from the row above
    if (date) lastDate = date; else date = lastDate;
    if (city) lastCity = city; else city = lastCity;
    if (dayNumber) lastDayNumber = dayNumber; else dayNumber = lastDayNumber;

    // Still no date even after carry-forward → skip (junk row before any real day)
    if (!date) return;

    const notes =
      Object.keys(extra).length > 0 ? JSON.stringify(extra) : undefined;

    // Each line inside the activity cell is its own activity
    const lines = activityName
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // No activity text → keep the day with a single placeholder activity (the city)
    if (lines.length === 0) lines.push(city || "—");

    lines.forEach((line, i) => {
      rows.push({
        date,
        city,
        day_number: dayNumber,
        activity_name: line,
        // Day-level details (hotel, restaurant, distances, description) attach to the first activity only
        description: i === 0 ? description : "",
        address: i === 0 ? address : "",
        notes: i === 0 ? notes : undefined,
        start_time: i === 0 ? startTime : undefined,
        end_time: i === 0 ? endTime : undefined,
      } as ExcelRow);
    });
  });

  if (rows.length === 0) throw new Error("No valid rows found in the Excel file.");

  return {
    trip_name: tripName || sheetName || "Norway Trip",
    rows,
  };
}
