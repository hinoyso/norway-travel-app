"use client";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ExcelUploader } from "@/components/upload/ExcelUploader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 px-4 py-4 sticky top-0 z-30 glass border-b border-border/50">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-lg">Upload Itinerary</h1>
            <p className="text-xs text-muted-foreground">Import your Excel travel plan</p>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/15 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm text-primary">Expected Excel Format</p>
            </div>
            <div className="space-y-1.5">
              {[
                ["Date", "2024-07-01 or 01/07/2024"],
                ["Day Number", "1, 2, 3…"],
                ["City", "Oslo, Bergen…"],
                ["Activity Name", "Name of the activity"],
                ["Description", "What to do / see"],
                ["Start Time", "09:00"],
                ["End Time", "11:00"],
                ["Address", "Full address or landmark"],
                ["Notes", "Tips, reminders, bookings"],
              ].map(([col, hint]) => (
                <div key={col} className="flex items-baseline gap-2 text-xs">
                  <span className="font-semibold text-foreground w-28 shrink-0">{col}</span>
                  <span className="text-muted-foreground">{hint}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Download template */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <a
              href="/template.xlsx"
              download
              className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Download Template</p>
                  <p className="text-xs text-muted-foreground">Pre-formatted Excel file</p>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </motion.div>

          {/* Uploader */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ExcelUploader />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
