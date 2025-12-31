import jsPDF from "jspdf";
import { ReceiptTheme } from "./receiptTheme";
import { receiptRows } from "./receiptTable";

export function generateReceiptPDF(tx: any) {
  const doc = new jsPDF("p", "mm", "a4");

  // Background
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, 210, 297, "F");

  // Logo
  doc.addImage("/logo.png", "PNG", 15, 15, 40, 20);

  // Title
  doc.setFontSize(18);
  doc.setTextColor(ReceiptTheme.primary);
  doc.text("Transaction Receipt", 105, 45, { align: "center" });

  // Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 55, 180, 150, 4, 4, "F");

  // Table
  let y = 70;
  doc.setFontSize(11);
  doc.setTextColor(ReceiptTheme.text);

  receiptRows(tx).forEach(([label, value]) => {
    doc.setTextColor(ReceiptTheme.muted);
    doc.text(String(label), 25, y);

    doc.setTextColor(ReceiptTheme.text);
    doc.text(String(value), 120, y, { align: "right" });

    doc.setDrawColor(229, 231, 235);
    doc.line(25, y + 2, 185, y + 2);

    y += 12;
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(ReceiptTheme.muted);
  doc.text(
    "This is an official electronic receipt. No signature required.",
    105,
    275,
    { align: "center" }
  );

  doc.save(`receipt-${tx.id}.pdf`);
}
