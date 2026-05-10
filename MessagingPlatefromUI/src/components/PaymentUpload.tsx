import { useState, useCallback, useRef } from "react";
import { Upload, X, FileText, Image } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface Props {
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PaymentUpload({ onFileSelected, selectedFile }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, or PDF files are allowed.");
        onFileSelected(null);
        setPreview(null);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File must be smaller than 5 MB.");
        onFileSelected(null);
        setPreview(null);
        return;
      }
      onFileSelected(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null); // PDF — show icon instead
      }
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleRemove = () => {
    onFileSelected(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="payment-upload">
      {/* Drop zone */}
      {!selectedFile && (
        <div
          className={`upload-dropzone${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <Upload size={32} className="upload-icon" />
          <p className="upload-hint">
            Drag &amp; drop or <span className="upload-link">browse</span>
          </p>
          <p className="upload-sub">JPG, PNG, PDF · max 5 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      )}

      {/* Preview */}
      {selectedFile && (
        <div className="upload-preview">
          {preview ? (
            <img
              src={preview}
              alt="Payment proof preview"
              className="upload-image-preview"
            />
          ) : (
            <div className="upload-pdf-preview">
              <FileText size={40} />
              <span>{selectedFile.name}</span>
            </div>
          )}

          <div className="upload-file-meta">
            <Image size={14} />
            <span className="upload-filename">{selectedFile.name}</span>
            <span className="upload-filesize">
              ({humanSize(selectedFile.size)})
            </span>
            <button
              type="button"
              className="upload-remove"
              onClick={handleRemove}
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
