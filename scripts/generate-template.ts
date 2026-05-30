// Run with: npx ts-node scripts/generate-template.ts
// Outputs: public/template.xlsx
import ExcelJS from "exceljs";
import path from "path";

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Norway Travel App";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Norway Itinerary");

  sheet.columns = [
    { header: "Date",          key: "date",          width: 14 },
    { header: "Day Number",    key: "day_number",    width: 12 },
    { header: "City",          key: "city",          width: 18 },
    { header: "Activity Name", key: "activity_name", width: 38 },
    { header: "Description",   key: "description",   width: 52 },
    { header: "Start Time",    key: "start_time",    width: 12 },
    { header: "End Time",      key: "end_time",      width: 12 },
    { header: "Address",       key: "address",       width: 46 },
    { header: "Notes",         key: "notes",         width: 42 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B4F8A" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF2D6A9F" } },
    };
  });
  headerRow.height = 28;

  const sampleRows = [
    { date: "2024-07-01", day_number: 1, city: "Oslo",    activity_name: "Arrive at Oslo Gardermoen Airport",  description: "Pick up luggage, meet transfer",                  start_time: "14:00", end_time: "15:00", address: "Oslo Gardermoen Airport, Oslo",          notes: "Flight number: SK123" },
    { date: "2024-07-01", day_number: 1, city: "Oslo",    activity_name: "Check-in to Hotel Continental",      description: "Luxury hotel in the heart of Oslo",              start_time: "15:30", end_time: "16:30", address: "Stortingsgaten 24/26, 0117 Oslo",        notes: "Book airport taxi in advance" },
    { date: "2024-07-01", day_number: 1, city: "Oslo",    activity_name: "Dinner at Ekebergrestauranten",       description: "Panoramic views of the Oslo fjord",              start_time: "19:00", end_time: "21:00", address: "Kongsveien 15, 0193 Oslo",               notes: "Reservation required" },
    { date: "2024-07-02", day_number: 2, city: "Oslo",    activity_name: "Vigeland Sculpture Park",            description: "World's largest sculpture park by one artist",   start_time: "09:00", end_time: "11:00", address: "Nobels gate 32, 0268 Oslo",              notes: "Free entry" },
    { date: "2024-07-02", day_number: 2, city: "Oslo",    activity_name: "Norwegian Folk Museum",              description: "Open-air museum with 160+ historic buildings",   start_time: "11:30", end_time: "14:00", address: "Museumsveien 10, 0287 Oslo",             notes: "Audio guide available" },
    { date: "2024-07-02", day_number: 2, city: "Oslo",    activity_name: "Lunch at Mathallen Food Hall",       description: "Artisan food market with Norwegian specialties", start_time: "14:00", end_time: "15:00", address: "Vulkan 5, 0178 Oslo",                    notes: "Try the salmon and brown cheese" },
    { date: "2024-07-03", day_number: 3, city: "Flåm",   activity_name: "Bergen Railway to Myrdal",           description: "One of the world's most scenic train journeys",  start_time: "08:05", end_time: "10:55", address: "Oslo Central Station, Oslo",             notes: "Book tickets in advance! Very popular." },
    { date: "2024-07-03", day_number: 3, city: "Flåm",   activity_name: "Flåm Railway",                       description: "Dramatic descent through mountain scenery",      start_time: "11:15", end_time: "12:15", address: "Myrdal Station, Myrdal",                 notes: "Purchase ticket at Myrdal" },
    { date: "2024-07-04", day_number: 4, city: "Bergen",  activity_name: "Sognefjord Cruise",                  description: "Norway's longest and deepest fjord cruise",      start_time: "09:00", end_time: "17:00", address: "Flåm Harbor, 5743 Flåm",                notes: "Bring warm layers!" },
    { date: "2024-07-04", day_number: 4, city: "Bergen",  activity_name: "Bryggen Wharf",                      description: "UNESCO World Heritage Hanseatic wharf",         start_time: "17:30", end_time: "19:00", address: "Bryggen, 5003 Bergen",                  notes: "Watch for rain — Bergen is rainy city" },
  ];

  sampleRows.forEach((row, i) => {
    const r = sheet.addRow(row);
    r.height = 22;
    r.eachCell((cell) => {
      cell.alignment = { vertical: "middle", wrapText: false };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: i % 2 === 0 ? "FFFFFFFF" : "FFF0F6FF" },
      };
    });
  });

  // Freeze header row
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: "I1" };

  const outputPath = path.join(process.cwd(), "public", "template.xlsx");
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Template written to ${outputPath}`);
}

main().catch(console.error);
