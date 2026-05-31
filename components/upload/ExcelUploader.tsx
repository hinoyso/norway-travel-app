"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

interface UploadResult {
  trip_id: string;
  days: number;
  activities?: number;
}

export function ExcelUploader() {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [tripName, setTripName] = useState("");
  const router = useRouter();

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setState("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (tripName.trim()) formData.append("trip_name", tripName.trim());

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setError(data.error ?? "Upload failed. Please try again.");
        return;
      }

      setState("success");
      setResult(data);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setState("error");
      setError("Network error. Please check your connection and try again.");
    }
  }, [tripName, router]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      {/* Trip name input */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Trip Name (optional)
        </label>
        <input
          type="text"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="e.g. Mom's Norway Adventure 2024"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          disabled={state === "uploading"}
        />
      </div>

      {/* Drop zone */}
      <label
        htmlFor="excel-upload"
        onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
        onDragLeave={() => setState("idle")}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300 min-h-[220px]",
          state === "dragging" && "border-primary bg-primary/5 scale-[1.01]",
          state === "idle" && "border-border hover:border-primary/50 hover:bg-accent/50",
          state === "uploading" && "border-primary/30 bg-primary/5 cursor-not-allowed",
          state === "success" && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
          state === "error" && "border-destructive/50 bg-destructive/5",
        )}
      >
        <input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={handleInput}
          disabled={state === "uploading" || state === "success"}
        />

        <AnimatePresence mode="wait">
          {state === "idle" || state === "dragging" ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">
                  {state === "dragging" ? "Drop it here!" : "Upload Excel Itinerary"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop your .xlsx file, or tap to browse
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-muted rounded-lg px-2 py-1">Date</span>
                <span className="bg-muted rounded-lg px-2 py-1">City</span>
                <span className="bg-muted rounded-lg px-2 py-1">Activity</span>
                <span className="bg-muted rounded-lg px-2 py-1">Address</span>
              </div>
            </motion.div>
          ) : state === "uploading" ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-semibold">Processing your itinerary…</p>
                <p className="text-sm text-muted-foreground mt-1">Parsing activities and saving to database</p>
              </div>
            </motion.div>
          ) : state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <div className="text-center">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-lg">
                  Itinerary uploaded!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result?.days} days · {result?.activities ?? 0} activities imported — redirecting…
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="text-center">
                <p className="font-semibold text-destructive">Upload failed</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">{error}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setState("idle"); setError(null); }}
              >
                Try again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </label>
    </div>
  );
}
