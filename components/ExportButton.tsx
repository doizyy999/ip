"use client";

import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText } from "lucide-react";
import { downloadFile, toCSV } from "@/lib/utils";
import { toast } from "sonner";

export function ExportButton({
  data,
  filename,
}: {
  data: unknown;
  filename: string;
}) {
  function exportJSON() {
    downloadFile(`${filename}.json`, JSON.stringify(data, null, 2), "application/json");
    toast.success("JSON exported");
  }
  function exportCSV() {
    const rows = Array.isArray(data)
      ? (data as Record<string, unknown>[])
      : [data as Record<string, unknown>];
    downloadFile(`${filename}.csv`, toCSV(rows), "text/csv");
    toast.success("CSV exported");
  }
  function exportPDF() {
    window.print(); // print-to-PDF native browser
  }
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportJSON}>
        <FileJson className="mr-1 h-3.5 w-3.5" /> JSON
      </Button>
      <Button variant="outline" size="sm" onClick={exportCSV}>
        <FileText className="mr-1 h-3.5 w-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF}>
        <Download className="mr-1 h-3.5 w-3.5" /> PDF
      </Button>
    </div>
  );
}
