import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BillingStatusBadge from "../components/BillingStatusBadge";
import { Loader } from "../components/Loader";
import PaymentUpload from "../components/PaymentUpload";
import {
  useBilling,
  useRejectBilling,
  useUploadPayment,
  useVerifyPayment,
} from "../hooks/useBillings";
import { useToastStore } from "../store/toastStore";
import API_BASE_URL from "../constants/api";

const API_BASE = API_BASE_URL;

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function BillingDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const { data: billing, isLoading, isError } = useBilling(id);

  const verifyMutation = useVerifyPayment();
  const rejectMutation = useRejectBilling();
  const uploadMutation = useUploadPayment();

  const [showVerify, setShowVerify] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const canAct =
    billing?.paymentStatus === "Pending" ||
    billing?.paymentStatus === "PartiallyPaid";

  const handleVerify = () => {
    verifyMutation.mutate(id, { onSuccess: () => setShowVerify(false) });
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { id, rejectionReason: rejectReason.trim() },
      {
        onSuccess: () => {
          setShowReject(false);
          setRejectReason("");
        },
      },
    );
  };

  const handleUpload = () => {
    if (!uploadFile) {
      addToast("Please select a file.", "error");
      return;
    }
    uploadMutation.mutate(
      { billingId: id, file: uploadFile },
      {
        onSuccess: () => {
          setShowUpload(false);
          setUploadFile(null);
        },
      },
    );
  };

  if (isLoading) return <Loader />;
  if (isError || !billing) {
    return (
      <div className="page-container">
        <p className="text-error">Billing record not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Back + header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/admin/billing")}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">{billing.billingNumber}</h1>
            <p className="page-subtitle">Billing Details</p>
          </div>
        </div>

        {canAct && (
          <div className="flex gap-2">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowUpload(true);
                setUploadFile(null);
              }}
            >
              <Upload size={15} />
              Upload Proof
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowVerify(true)}
            >
              <CheckCircle size={15} />
              Verify
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowReject(true)}
            >
              <XCircle size={15} />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="details-grid">
        {/* Billing info */}
        <div className="detail-card">
          <h3 className="detail-card-title">Billing Info</h3>
          <dl className="detail-list">
            <dt>Billing #</dt>
            <dd className="font-mono font-semibold">{billing.billingNumber}</dd>
            <dt>Status</dt>
            <dd>
              <BillingStatusBadge status={billing.paymentStatus} />
            </dd>
            <dt>Payment Method</dt>
            <dd>{billing.paymentMethod}</dd>
            <dt>Created By</dt>
            <dd>{billing.createdBy ?? "—"}</dd>
            <dt>Created At</dt>
            <dd>{formatDate(billing.createdAt)}</dd>
            {billing.verifiedBy && (
              <>
                <dt>Verified By</dt>
                <dd>{billing.verifiedBy}</dd>
                <dt>Verified At</dt>
                <dd>{formatDate(billing.verifiedAt)}</dd>
              </>
            )}
            {billing.notes && (
              <>
                <dt>Notes</dt>
                <dd>{billing.notes}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Client + Quotation */}
        <div className="detail-card">
          <h3 className="detail-card-title">Client & Quotation</h3>
          <dl className="detail-list">
            <dt>Client</dt>
            <dd>{billing.clientName}</dd>
            <dt>Quotation #</dt>
            <dd className="font-mono">{billing.quotationNumber}</dd>
          </dl>
        </div>

        {/* Financials */}
        <div className="detail-card">
          <h3 className="detail-card-title">Financials</h3>
          <dl className="detail-list">
            <dt>Total Amount</dt>
            <dd className="text-xl font-bold">
              {formatINR(billing.totalAmount)}
            </dd>
            <dt>Paid Amount</dt>
            <dd>{formatINR(billing.paidAmount)}</dd>
            <dt>Credits Included</dt>
            <dd>{billing.includedCredits.toLocaleString()} credits</dd>
          </dl>
        </div>
      </div>

      {/* Payment References */}
      <div className="section">
        <h2 className="section-title">
          Payment Proof ({billing.paymentReferences.length})
        </h2>

        {billing.paymentReferences.length === 0 ? (
          <p className="text-muted">No payment proof uploaded yet.</p>
        ) : (
          <div className="proof-grid">
            {billing.paymentReferences.map((ref) => {
              const isImage =
                ref.fileType === "JPG" ||
                ref.fileType === "JPEG" ||
                ref.fileType === "PNG";
              const fullUrl = `${API_BASE}${ref.fileUrl}`;

              return (
                <div key={ref.id} className="proof-card">
                  {isImage ? (
                    <img
                      src={fullUrl}
                      alt={ref.fileName}
                      className="proof-thumb"
                      onClick={() => setLightboxUrl(fullUrl)}
                      style={{ cursor: "zoom-in" }}
                    />
                  ) : (
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proof-pdf-icon"
                    >
                      <FileText size={40} />
                    </a>
                  )}
                  <div className="proof-meta">
                    <span className="proof-name" title={ref.fileName}>
                      {ref.fileName}
                    </span>
                    <span className="proof-size">
                      {humanSize(ref.fileSize)}
                    </span>
                    <span className="proof-date">
                      {formatDate(ref.uploadedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="lightbox-overlay" onClick={() => setLightboxUrl(null)}>
          <button
            className="lightbox-close"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxUrl}
            alt="Payment proof"
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Verify Modal ──────────────────────────────────────────────────── */}
      {showVerify && (
        <div className="modal-overlay" onClick={() => setShowVerify(false)}>
          <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <CheckCircle size={20} className="text-green" />
              <h2>Verify Payment</h2>
              <button
                className="modal-close"
                onClick={() => setShowVerify(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p>
              Confirm payment for <strong>{billing.billingNumber}</strong>? This
              will activate{" "}
              <strong>
                {billing.includedCredits.toLocaleString()} credits
              </strong>{" "}
              for <strong>{billing.clientName}</strong>.
            </p>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Verifying…" : "Confirm Verify"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowVerify(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ──────────────────────────────────────────────────── */}
      {showReject && (
        <div className="modal-overlay" onClick={() => setShowReject(false)}>
          <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <XCircle size={20} className="text-red" />
              <h2>Reject Billing</h2>
              <button
                className="modal-close"
                onClick={() => setShowReject(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p>
              Reject billing <strong>{billing.billingNumber}</strong>?
            </p>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-input"
                rows={3}
                maxLength={500}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
              >
                {rejectMutation.isPending ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowReject(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ──────────────────────────────────────────────────── */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Payment Proof</h2>
              <button
                className="modal-close"
                onClick={() => setShowUpload(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="modal-subtitle">
              For billing <strong>{billing.billingNumber}</strong>
            </p>
            <PaymentUpload
              onFileSelected={setUploadFile}
              selectedFile={uploadFile}
            />
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!uploadFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading…" : "Upload"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
