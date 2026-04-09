export interface PinCodeResult {
  city: string;
  state: string;
}

export async function lookupPinCode(
  pinCode: string
): Promise<PinCodeResult | null> {
  // Indian PINs are always exactly 6 digits
  if (!pinCode || !/^\d{6}$/.test(pinCode)) return null;

  try {
    const res = await fetch(
      `https://api.postalpincode.in/pincode/${pinCode}`
    );

    if (!res.ok) return null;

    const data = await res.json();

    const status = data?.[0]?.Status;
    if (status !== "Success") return null;

    const office = data?.[0]?.PostOffice?.[0];
    if (!office) return null;

    return {
      city: office.District,  // "Varanasi"
      state: office.State,    // "Uttar Pradesh"
    };
  } catch (err) {
    console.error("PIN lookup failed:", err);
    return null;
  }
}