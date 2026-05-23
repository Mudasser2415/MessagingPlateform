import axiosInstance from "../utils/axiosInstance";

export interface AddressLookupResult {
  pinCode: string;
  state: string;
  district: string;
  taluk: string;
  postOffices: string[];
}

export const addressService = {
  /**
   * Looks up address data for an India PIN code via the backend proxy.
   * Returns null if the PIN code is invalid or not found.
   * Pass an AbortSignal to cancel a stale in-flight request.
   */
  lookupPinCode: async (
    pinCode: string,
    signal?: AbortSignal,
  ): Promise<AddressLookupResult | null> => {
    if (!/^\d{6}$/.test(pinCode)) return null;
    const response = await axiosInstance.get<AddressLookupResult>(
      `/address/pincode/${pinCode}`,
      { signal },
    );
    return response.data;
  },
};
