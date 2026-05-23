import { useEffect, useRef, useState } from "react";
import type { AddressLookupResult } from "../services/addressService";
import { addressService } from "../services/addressService";

export type PinLookupStatus =
  | "idle"
  | "fetching"
  | "success"
  | "invalid"
  | "error";

export interface UsePinCodeLookupReturn {
  status: PinLookupStatus;
  result: AddressLookupResult | null;
  /** Call this when the PIN input changes */
  onPinChange: (pin: string) => void;
}

const DEBOUNCE_MS = 500;

export function usePinCodeLookup(): UsePinCodeLookupReturn {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<PinLookupStatus>("idle");
  const [result, setResult] = useState<AddressLookupResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (pin.length < 6) {
      setStatus("idle");
      setResult(null);
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setStatus("invalid");
      setResult(null);
      return;
    }

    setStatus("fetching");

    const controller = new AbortController();
    abortRef.current = controller;

    timerRef.current = setTimeout(async () => {
      try {
        const data = await addressService.lookupPinCode(pin, controller.signal);
        if (data) {
          setResult(data);
          setStatus("success");
        } else {
          setResult(null);
          setStatus("invalid");
        }
      } catch (err) {
        // Ignore aborted requests — the user typed a new PIN
        if (err instanceof Error && err.name === "CanceledError") return;
        setResult(null);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      controller.abort();
    };
  }, [pin]);

  const onPinChange = (value: string) => {
    // Allow only digits, max 6
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setPin(cleaned);
    if (cleaned.length < 6) {
      setResult(null);
      setStatus("idle");
    }
  };

  return { status, result, onPinChange };
}
