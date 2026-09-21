// IMEI = 15 digit: TAC (8) + Serial Number (6) + Check Digit (1)
// TAC (Type Allocation Code) diterbitkan resmi oleh GSMA, mengidentifikasi
// brand + model perangkat. Check digit dihitung pakai algoritma Luhn.

export interface IMEIParsed {
  raw: string;
  tac: string;
  reportingBodyId: string; // 2 digit pertama TAC — kode badan sertifikasi/wilayah
  serialNumber: string;
  checkDigit: string;
  formatValid: boolean; // 15 digit numerik
  luhnValid: boolean; // checksum cocok
}

export function isNumeric15(value: string): boolean {
  return /^\d{15}$/.test(value);
}

// Algoritma Luhn standar (sama yang dipakai validasi nomor kartu kredit)
export function luhnCheckDigit(first14: string): number {
  let sum = 0;
  for (let i = 0; i < first14.length; i++) {
    let d = parseInt(first14[i], 10);
    // Dari kanan, posisi genap (index genap dari kiri untuk 14 digit) dikali 2
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

export function parseIMEI(input: string): IMEIParsed {
  const raw = input.replace(/[\s-]/g, "");
  const formatValid = isNumeric15(raw);

  if (!formatValid) {
    return {
      raw,
      tac: "",
      reportingBodyId: "",
      serialNumber: "",
      checkDigit: "",
      formatValid: false,
      luhnValid: false
    };
  }

  const first14 = raw.slice(0, 14);
  const checkDigit = raw[14];
  const expected = luhnCheckDigit(first14);
  const luhnValid = expected === parseInt(checkDigit, 10);

  return {
    raw,
    tac: raw.slice(0, 8),
    reportingBodyId: raw.slice(0, 2),
    serialNumber: raw.slice(8, 14),
    checkDigit,
    formatValid: true,
    luhnValid
  };
}
