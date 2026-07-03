import { useNavigate } from "react-router-dom";
import {
  Eye,
  Upload,
  CheckCircle,
  XCircle,
  Image,
  Download,
} from "lucide-react";
import type { BillingDto } from "../services/billingService";
import type { QuotationDto } from "../services/quotationService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import BillingStatusBadge from "./BillingStatusBadge";

interface Props {
  billings: BillingDto[];
  quotationLookup?: Record<string, QuotationDto>;
  onUpload: (billing: BillingDto) => void;
  onApprove: (billing: BillingDto) => void;
  onReject: (billing: BillingDto) => void;
  onPreview: (billing: BillingDto) => void;
}

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDocMoney(amount: number) {
  return `INR ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateForDoc(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB");
}

function drawKeyValueLine(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
) {
  doc.setFont("helvetica", "bold");
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.text(value, x + 72, y);
}

function downloadBillPdf(billing: BillingDto, quotation?: QuotationDto) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const headerX = 18;
  const headerY = 16;
  const headerWidth = pageWidth - 36;
  const headerHeight = 280;
  const tableStartY = headerY + headerHeight + 22;

  const fromBlock = [
    "Test Sender Technologies Pvt Ltd",
    "Plot 22, Tech Park Road",
    "Sector 62, Noida",
    "Uttar Pradesh, India - 201309",
    "Email: billing@testsender.in",
    "GSTN: 09AABCT5678H1Z2",
  ];

  const toBlock = [
    "Test Receiver Company Pvt Ltd",
    "AA-007, Ansal Golf Link-1",
    "Greater Noida",
    "Uttar Pradesh, India - 201310",
    "Email: accounts@testreceiver.in",
    "GSTN: 09AABCT1234F1Z5",
  ];

  const amount = quotation?.finalPrice ?? billing.totalAmount;
  const igst =
    quotation && billing.totalAmount >= quotation.finalPrice
      ? billing.totalAmount - quotation.finalPrice
      : Math.round((billing.totalAmount * 0.18 + Number.EPSILON) * 100) / 100;
  const qty = quotation?.includedCredits ?? billing.includedCredits;
  const safeQty = qty > 0 ? qty : 1;
  const rate = amount / safeQty;
  const discountPercent =
    quotation && quotation.originalPrice > 0
      ? (quotation.discountAmount / quotation.originalPrice) * 100
      : 0;

  doc.setFillColor(243, 244, 246);
  doc.roundedRect(headerX, headerY, headerWidth, headerHeight, 10, 10, "F");

  doc.setFillColor(234, 162, 68);
  doc.roundedRect(headerX, 52, 32, 154, 16, 16, "F");

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("QUOTATION", 84, 66);

  doc.setFontSize(12);
  drawKeyValueLine(doc, 84, 94, "Quotation No :", billing.quotationNumber);
  drawKeyValueLine(doc, 84, 118, "Date :", formatDateForDoc(billing.createdAt));

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("*", pageWidth / 2 - 8, 80);

  doc.setTextColor(55, 65, 81);
  doc.setFontSize(30);
  doc.text("TEST COMPANY", pageWidth - 242, 90);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("Grow with us", pageWidth - 242, 116);

  doc.setDrawColor(234, 162, 68);
  doc.setLineWidth(1);
  doc.line(pageWidth - 242, 130, pageWidth - 74, 130);

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("From", 84, 164);
  doc.text("To", 330, 164);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const fromToStartY = 188;
  const fromToLineGap = 22;
  fromBlock.forEach((line, idx) => {
    doc.text(line, 84, fromToStartY + idx * fromToLineGap);
  });
  toBlock.forEach((line, idx) => {
    doc.text(line, 330, fromToStartY + idx * fromToLineGap);
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 18, right: 18 },
    theme: "plain",
    head: [["SN", "TITLE", "QTY", "RATE", "DC(%)", "AMOUNT", "IGST", "TOTAL"]],
    body: [
      [
        "1",
        quotation?.planName || "RCS Messages",
        safeQty.toLocaleString("en-IN"),
        rate.toFixed(2),
        discountPercent.toFixed(2),
        formatDocMoney(amount),
        formatDocMoney(igst),
        formatDocMoney(billing.totalAmount),
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: [17, 24, 39],
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
    },
    headStyles: {
      fontStyle: "bold",
      fillColor: [255, 255, 255],
      textColor: [17, 24, 39],
      lineWidth: { bottom: 0.8 },
      lineColor: [17, 24, 39],
    },
    bodyStyles: {
      lineWidth: { bottom: 0.2 },
      lineColor: [209, 213, 219],
    },
    columnStyles: {
      0: { cellWidth: 20, halign: "center" },
      1: { cellWidth: 126 },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
      4: { cellWidth: 40, halign: "right" },
      5: { cellWidth: 88, halign: "right" },
      6: { cellWidth: 88, halign: "right" },
      7: { cellWidth: 88, halign: "right" },
    },
  });

  const totalsTop = Math.max((doc as any).lastAutoTable.finalY + 28, 438);
  const totalsX = pageWidth - 300;

  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.8);
  doc.line(totalsX, totalsTop + 42, pageWidth - 24, totalsTop + 42);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(17);
  doc.text("* TOTAL", totalsX, totalsTop + 20);
  doc.text("SUMMARY", totalsX, totalsTop + 40);

  doc.setFontSize(11);
  doc.text("AMOUNT", totalsX, totalsTop + 70);
  doc.text(formatDocMoney(amount), pageWidth - 24, totalsTop + 70, {
    align: "right",
  });
  doc.text("IGST", totalsX, totalsTop + 94);
  doc.text(formatDocMoney(igst), pageWidth - 24, totalsTop + 94, {
    align: "right",
  });
  doc.text("GRAND TOTAL (INR)", totalsX, totalsTop + 132);
  doc.text(
    formatDocMoney(billing.totalAmount),
    pageWidth - 24,
    totalsTop + 132,
    {
      align: "right",
    },
  );

  const termsTop = totalsTop + 170;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Term and Conditions :", 18, termsTop);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const terms = [
    "1. 100 % Advance Payment.",
    "2. All plans have Lifetime Validity.",
    "3. All our Services are in Submission basis.",
    "4. Business WhatsApp Template approval and category decided by META only.",
    "5. Meta Verification is Mandatory For Whatsapp Business API.",
    "6. Prices and credits are subject to TRAI/Operator/META interconnect guidelines.",
    "7. Approval timelines and results are subject to Meta policy and account status.",
  ];
  terms.forEach((line, idx) => {
    doc.text(line, 18, termsTop + 22 + idx * 20);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    "This is an electronically generated document, no signature is required.",
    pageWidth / 2,
    Math.min(pageHeight - 18, termsTop + 188),
    { align: "center" },
  );

  doc.save(`${billing.billingNumber}.pdf`);
}

export default function BillingTable({
  billings,
  quotationLookup,
  onUpload,
  onApprove,
  onReject,
  onPreview,
}: Props) {
  const navigate = useNavigate();

  if (billings.length === 0) {
    return (
      <div className="empty-state">
        <p>No billing records found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Billing #</th>
            <th>Client</th>
            <th>Quotation #</th>
            <th>Amount</th>
            <th>Credits</th>
            <th>Status</th>
            <th>Method</th>
            <th>Proof</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {billings.map((b) => (
            <tr
              key={b.id}
              className={
                b.paymentStatus === "Pending" ? "row-highlight-pending" : ""
              }
            >
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-secondary btn-sm"
                    title="View details"
                    onClick={() => navigate(`/admin/billing/${b.id}`)}
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    title="Download bill"
                    onClick={() =>
                      downloadBillPdf(b, quotationLookup?.[b.quotationId])
                    }
                  >
                    <Download size={14} />
                  </button>

                  {b.paymentStatus === "Pending" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      title="Upload payment proof"
                      onClick={() => onUpload(b)}
                    >
                      <Upload size={14} />
                    </button>
                  )}

                  {b.paymentStatus === "Pending" && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        title="Approve billing"
                        onClick={() => onApprove(b)}
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Reject billing"
                        onClick={() => onReject(b)}
                      >
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                </div>
              </td>
              <td>
                <span className="font-mono text-sm font-semibold">
                  {b.billingNumber}
                </span>
              </td>
              <td>{b.clientName}</td>
              <td>
                <span className="text-muted">{b.quotationNumber}</span>
              </td>
              <td>{formatINR(b.totalAmount)}</td>
              <td>{b.includedCredits.toLocaleString()}</td>
              <td>
                <BillingStatusBadge status={b.paymentStatus} />
              </td>
              <td>{b.paymentMethod}</td>
              <td>
                {b.paymentReferences.length > 0 ? (
                  <button
                    className="proof-count-badge"
                    title="View payment proof"
                    onClick={() => onPreview(b)}
                  >
                    <Image size={12} />
                    {b.paymentReferences.length}
                  </button>
                ) : (
                  <span className="text-muted text-xs">None</span>
                )}
              </td>
              <td>{formatDate(b.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
