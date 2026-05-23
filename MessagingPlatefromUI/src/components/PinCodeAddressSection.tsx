import { LoaderCircle, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AddressLookupResult } from "../services/addressService";
import type { PinLookupStatus } from "../hooks/usePinCodeLookup";

export interface AddressData {
  pinCode: string;
  state: string;
  district: string;
  taluk: string;
  postOffice: string;
}

interface Props {
  /** Current address values */
  value: AddressData;
  /** Called whenever any address field changes */
  onChange: (data: AddressData) => void;
  /** Current lookup status from usePinCodeLookup */
  lookupStatus: PinLookupStatus;
  /** Result from usePinCodeLookup (when status === "success") */
  lookupResult: AddressLookupResult | null;
  /** Called when the PIN input changes — wire to usePinCodeLookup.onPinChange */
  onPinChange: (pin: string) => void;
  /** Field-level validation errors */
  errors?: Partial<Record<keyof AddressData, string>>;
  /** Whether to mark PIN code as required */
  required?: boolean;
  disabled?: boolean;
}

function StatusMessage({ status }: { status: PinLookupStatus }) {
  if (status === "fetching")
    return (
      <span className="pin-status pin-status--fetching">
        <LoaderCircle size={13} className="pin-spinner" />
        Fetching address…
      </span>
    );
  if (status === "success")
    return (
      <span className="pin-status pin-status--success">
        <CheckCircle2 size={13} />
        Address found
      </span>
    );
  if (status === "invalid")
    return (
      <span className="pin-status pin-status--error">
        <AlertCircle size={13} />
        Invalid PIN code
      </span>
    );
  if (status === "error")
    return (
      <span className="pin-status pin-status--error">
        <AlertCircle size={13} />
        Unable to fetch address
      </span>
    );
  return null;
}

export default function PinCodeAddressSection({
  value,
  onChange,
  lookupStatus,
  lookupResult,
  onPinChange,
  errors = {},
  required = false,
  disabled = false,
}: Props) {
  const isFetching = lookupStatus === "fetching";
  const hasResult = lookupStatus === "success" && lookupResult !== null;
  const addressDisabled = disabled || isFetching;

  const setField = (key: keyof AddressData, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const handlePinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    onPinChange(raw);
    setField("pinCode", raw);

    // When PIN is cleared, also clear fetched fields
    if (raw.length < 6) {
      onChange({
        ...value,
        pinCode: raw,
        state: "",
        district: "",
        taluk: "",
        postOffice: "",
      });
    }
  };

  // Sync result into form when lookup succeeds
  const handlePostOfficeSelect = (po: string) => {
    setField("postOffice", po);
  };

  // Sync result into parent when lookup succeeds (after render)
  // The parent is responsible for calling onChange when result arrives —
  // exposed via the hasResult flag + lookupResult prop.

  return (
    <div className="pin-address-section">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="pin-address-header">
        <MapPin size={15} className="pin-address-icon" />
        <span className="pin-address-title">Address & Location</span>
      </div>

      <div className="pin-address-grid">
        {/* PIN Code */}
        <div className="pin-field-group">
          <label className="pin-field-label">
            PIN Code
            {required && <span className="pin-required">*</span>}
          </label>
          <div className="pin-input-wrapper">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              className={`form-input pin-input${errors.pinCode ? " form-input--error" : ""}`}
              placeholder="e.g. 560001"
              value={value.pinCode}
              onChange={handlePinInput}
              disabled={disabled}
              autoComplete="postal-code"
            />
            {isFetching && (
              <LoaderCircle size={16} className="pin-input-spinner" />
            )}
          </div>
          <StatusMessage status={lookupStatus} />
          {errors.pinCode && (
            <span className="pin-field-error">{errors.pinCode}</span>
          )}
        </div>

        {/* State */}
        <div className="pin-field-group">
          <label className="pin-field-label">State</label>
          <input
            type="text"
            className="form-input"
            placeholder="Auto-filled"
            value={value.state}
            onChange={(e) => setField("state", e.target.value)}
            disabled={addressDisabled}
            readOnly={hasResult}
          />
          {errors.state && (
            <span className="pin-field-error">{errors.state}</span>
          )}
        </div>

        {/* District */}
        <div className="pin-field-group">
          <label className="pin-field-label">District</label>
          <input
            type="text"
            className="form-input"
            placeholder="Auto-filled"
            value={value.district}
            onChange={(e) => setField("district", e.target.value)}
            disabled={addressDisabled}
            readOnly={hasResult}
          />
          {errors.district && (
            <span className="pin-field-error">{errors.district}</span>
          )}
        </div>

        {/* Taluk / Block */}
        <div className="pin-field-group">
          <label className="pin-field-label">Taluk / Block</label>
          <input
            type="text"
            className="form-input"
            placeholder="Auto-filled"
            value={value.taluk}
            onChange={(e) => setField("taluk", e.target.value)}
            disabled={addressDisabled}
            readOnly={hasResult}
          />
        </div>

        {/* Post Office */}
        <div className="pin-field-group">
          <label className="pin-field-label">Post Office</label>
          {hasResult && lookupResult!.postOffices.length > 1 ? (
            <select
              className="form-input"
              value={value.postOffice}
              onChange={(e) => handlePostOfficeSelect(e.target.value)}
              disabled={addressDisabled}
            >
              <option value="">Select post office</option>
              {lookupResult!.postOffices.map((po) => (
                <option key={po} value={po}>
                  {po}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-input"
              placeholder="Auto-filled"
              value={value.postOffice}
              onChange={(e) => setField("postOffice", e.target.value)}
              disabled={addressDisabled}
              readOnly={hasResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}
