import { useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import type {
  BillingDto,
  PaymentReferenceDto,
} from "../services/billingService";

interface Props {
  billing: BillingDto;
  initialIndex?: number;
  onClose: () => void;
}

const API_BASE = "http://localhost:5008";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PaymentPreviewModal({
  billing,
  initialIndex = 0,
  onClose,
}: Props) {
  const refs = billing.paymentReferences;
  const [index, setIndex] = useState(Math.min(initialIndex, refs.length - 1));
  const [zoom, setZoom] = useState(1);

  if (refs.length === 0) return null;

  const current: PaymentReferenceDto = refs[index];
  const isImg = ["JPG", "JPEG", "PNG"].includes(current.fileType.toUpperCase());
  const isPdf = current.fileType.toUpperCase() === "PDF";
  const fileUrl = `${API_BASE}${current.fileUrl}`;

  const prev = () => {
    setIndex((i) => (i > 0 ? i - 1 : refs.length - 1));
    setZoom(1);
  };
  const next = () => {
    setIndex((i) => (i < refs.length - 1 ? i + 1 : 0));
    setZoom(1);
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className="preview-topbar">
          <div className="preview-topbar-info">
            <span className="preview-billing-num">{billing.billingNumber}</span>
            <span className="preview-sep">·</span>
            <span className="preview-filename">{current.fileName}</span>
            <span className="preview-size">
              {formatBytes(current.fileSize)}
            </span>
          </div>
          <div className="preview-topbar-actions">
            {isImg && (
              <>
                <button
                  className="preview-action-btn"
                  onClick={zoomOut}
                  title="Zoom out"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="preview-zoom-label">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  className="preview-action-btn"
                  onClick={zoomIn}
                  title="Zoom in"
                  disabled={zoom >= 3}
                >
                  <ZoomIn size={16} />
                </button>
              </>
            )}
            <a
              href={fileUrl}
              download={current.fileName}
              className="preview-action-btn"
              title="Download"
            >
              <Download size={16} />
            </a>
            <button
              className="preview-action-btn preview-close-btn"
              onClick={onClose}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="preview-body">
          {isImg && (
            <div className="preview-img-wrapper">
              <img
                src={fileUrl}
                alt={current.fileName}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                }}
                className="preview-img"
              />
            </div>
          )}
          {isPdf && (
            <iframe
              src={fileUrl}
              title={current.fileName}
              className="preview-pdf-frame"
            />
          )}
          {!isImg && !isPdf && (
            <div className="preview-unknown">
              <FileText size={48} />
              <p>{current.fileName}</p>
              <a
                href={fileUrl}
                download={current.fileName}
                className="btn btn-primary"
              >
                Download File
              </a>
            </div>
          )}
        </div>

        {/* Navigation */}
        {refs.length > 1 && (
          <div className="preview-nav">
            <button className="preview-nav-btn" onClick={prev}>
              <ChevronLeft size={20} />
            </button>
            <span className="preview-nav-counter">
              {index + 1} / {refs.length}
            </span>
            <button className="preview-nav-btn" onClick={next}>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Thumbnail strip */}
        {refs.length > 1 && (
          <div className="preview-strip">
            {refs.map((r, i) => {
              const isImgRef = ["JPG", "JPEG", "PNG"].includes(
                r.fileType.toUpperCase(),
              );
              return (
                <button
                  key={r.id}
                  className={`preview-strip-item${i === index ? " active" : ""}`}
                  onClick={() => {
                    setIndex(i);
                    setZoom(1);
                  }}
                  title={r.fileName}
                >
                  {isImgRef ? (
                    <img src={`${API_BASE}${r.fileUrl}`} alt={r.fileName} />
                  ) : (
                    <div className="preview-strip-pdf">PDF</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
