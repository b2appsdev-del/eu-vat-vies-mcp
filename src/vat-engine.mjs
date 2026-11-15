/**
 * Deterministic EU VAT Format, Check-Digit, Intra-EU B2B Reverse-Charge & Invoice Compliance Engine
 * Educational & planning tool only; not tax, legal, or financial advice.
 */

export const DISCLAIMER =
  "Educational & technical compliance planning tool only; does not constitute tax, legal, or accounting advice.";

export const EU_VAT_SPEC = {
  AT: { name: "Austria", standardRate: 20, reducedRates: [10, 13], regex: /^ATU\d{8}$/, formatHint: "ATU + 8 digits" },
  BE: { name: "Belgium", standardRate: 21, reducedRates: [6, 12], regex: /^BE[01]\d{9}$/, formatHint: "BE + 0/1 + 9 digits" },
  BG: { name: "Bulgaria", standardRate: 20, reducedRates: [9], regex: /^BG\d{9,10}$/, formatHint: "BG + 9 or 10 digits" },
  CY: { name: "Cyprus", standardRate: 19, reducedRates: [5, 9], regex: /^CY\d{8}[A-Z]$/, formatHint: "CY + 8 digits + 1 letter" },
  CZ: { name: "Czechia", standardRate: 21, reducedRates: [12], regex: /^CZ\d{8,10}$/, formatHint: "CZ + 8 to 10 digits" },
  DE: { name: "Germany", standardRate: 19, reducedRates: [7], regex: /^DE\d{9}$/, formatHint: "DE + 9 digits" },
  DK: { name: "Denmark", standardRate: 25, reducedRates: [], regex: /^DK\d{8}$/, formatHint: "DK + 8 digits" },
  EE: { name: "Estonia", standardRate: 22, reducedRates: [5, 9], regex: /^EE\d{9}$/, formatHint: "EE + 9 digits" },
  EL: { name: "Greece", standardRate: 24, reducedRates: [6, 13], regex: /^EL\d{9}$/, formatHint: "EL + 9 digits" },
  ES: { name: "Spain", standardRate: 21, reducedRates: [4, 10], regex: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/, formatHint: "ES + 9 alphanumeric chars" },
  FI: { name: "Finland", standardRate: 25.5, reducedRates: [10, 14], regex: /^FI\d{8}$/, formatHint: "FI + 8 digits" },
  FR: { name: "France", standardRate: 20, reducedRates: [5.5, 10], regex: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/, formatHint: "FR + 2 key chars + 9 digits" },
  HR: { name: "Croatia", standardRate: 25, reducedRates: [5, 13], regex: /^HR\d{11}$/, formatHint: "HR + 11 digits" },
  HU: { name: "Hungary", standardRate: 27, reducedRates: [5, 18], regex: /^HU\d{8}$/, formatHint: "HU + 8 digits" },
  IE: { name: "Ireland", standardRate: 23, reducedRates: [9, 13.5], regex: /^IE\d{7}[A-Z]{1,2}$/, formatHint: "IE + 7 digits + 1-2 letters" },
  IT: { name: "Italy", standardRate: 22, reducedRates: [4, 5, 10], regex: /^IT\d{11}$/, formatHint: "IT + 11 digits" },
  LT: { name: "Lithuania", standardRate: 21, reducedRates: [5, 9], regex: /^LT(?:\d{9}|\d{12})$/, formatHint: "LT + 9 or 12 digits" },
  LU: { name: "Luxembourg", standardRate: 17, reducedRates: [8, 14], regex: /^LU\d{8}$/, formatHint: "LU + 8 digits" },
  LV: { name: "Latvia", standardRate: 21, reducedRates: [5, 12], regex: /^LV\d{11}$/, formatHint: "LV + 11 digits" },
  MT: { name: "Malta", standardRate: 18, reducedRates: [5, 7], regex: /^MT\d{8}$/, formatHint: "MT + 8 digits" },
  NL: { name: "Netherlands", standardRate: 21, reducedRates: [9], regex: /^NL\d{9}B\d{2}$/, formatHint: "NL + 9 digits + B + 2 digits" },
  PL: { name: "Poland", standardRate: 23, reducedRates: [5, 8], regex: /^PL\d{10}$/, formatHint: "PL + 10 digits" },
  PT: { name: "Portugal", standardRate: 23, reducedRates: [6, 13], regex: /^PT\d{9}$/, formatHint: "PT + 9 digits" },
  RO: { name: "Romania", standardRate: 19, reducedRates: [5, 9], regex: /^RO\d{2,10}$/, formatHint: "RO + 2 to 10 digits" },
  SE: { name: "Sweden", standardRate: 25, reducedRates: [6, 12], regex: /^SE\d{10}01$/, formatHint: "SE + 10 digits + 01" },
  SI: { name: "Slovenia", standardRate: 22, reducedRates: [5, 9.5], regex: /^SI\d{8}$/, formatHint: "SI + 8 digits" },
  SK: { name: "Slovakia", standardRate: 23, reducedRates: [5, 19], regex: /^SK\d{10}$/, formatHint: "SK + 10 digits" },
  XI: { name: "Northern Ireland (Protocol)", standardRate: 20, reducedRates: [5], regex: /^XI(?:\d{9}|\d{12})$/, formatHint: "XI + 9 or 12 digits (Goods only)" },
};

export function normalizeVatNumber(raw) {
  if (typeof raw !== "string") return "";
  let cleaned = raw.toUpperCase().replace(/[\s.\-_]/g, "");
  if (cleaned.startsWith("GR")) {
    cleaned = "EL" + cleaned.slice(2);
  }
  return cleaned;
}

function verifyCheckDigit(country, body) {
  const digits = body.split("").map((c) => parseInt(c, 10));

  switch (country) {
    case "DE": {
      // ISO 7064, Mod 11, 10
      let product = 10;
      for (let i = 0; i < 8; i++) {
        let sum = (digits[i] + product) % 10;
        if (sum === 0) sum = 10;
        product = (2 * sum) % 11;
      }
      const check = 11 - product === 10 ? 0 : 11 - product;
      return { checked: true, valid: check === digits[8], algorithm: "ISO-7064-Mod-11-10" };
    }
    case "EL": {
      // Greece 9-digit Mod 11 weighted
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += digits[i] * Math.pow(2, 8 - i);
      }
      const check = (sum % 11) % 10;
      return { checked: true, valid: check === digits[8], algorithm: "EL-Mod-11-Pow2" };
    }
    case "BE": {
      const base = parseInt(body.slice(0, 8), 10);
      const check = parseInt(body.slice(8, 10), 10);
      return { checked: true, valid: 97 - (base % 97) === check, algorithm: "BE-Mod-97" };
    }
    case "DK":
    case "FI": {
      const weights = country === "DK" ? [2, 7, 6, 5, 4, 3, 2, 1] : [7, 9, 10, 5, 8, 4, 2, 1];
      let sum = 0;
      for (let i = 0; i < 7; i++) sum += digits[i] * weights[i];
      if (country === "DK") {
        sum += digits[7] * weights[7];
        return { checked: true, valid: sum % 11 === 0, algorithm: "DK-Mod-11" };
      }
      const rem = 11 - (sum % 11);
      const check = rem === 11 ? 0 : rem === 10 ? -1 : rem;
      return { checked: true, valid: check === digits[7], algorithm: "FI-Mod-11" };
    }
    case "FR": {
      const keyStr = body.slice(0, 2);
      const sirenStr = body.slice(2);
      if (/^\d{2}$/.test(keyStr)) {
        const key = parseInt(keyStr, 10);
        const siren = parseInt(sirenStr, 10);
        const expected = (12 + 3 * (siren % 97)) % 97;
        return { checked: true, valid: key === expected, algorithm: "FR-SIREN-Mod-97" };
      }
      return { checked: false, valid: true, algorithm: "FR-Alphanumeric-Format" };
    }
    case "IT": {
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          sum += digits[i];
        } else {
          const doubled = digits[i] * 2;
          sum += doubled > 9 ? doubled - 9 : doubled;
        }
      }
      const check = (10 - (sum % 10)) % 10;
      return { checked: true, valid: check === digits[10], algorithm: "IT-Luhn-Mod-10" };
    }
    case "LU": {
      const base = parseInt(body.slice(0, 6), 10);
      const check = parseInt(body.slice(6, 8), 10);
      return { checked: true, valid: base % 89 === check, algorithm: "LU-Mod-89" };
    }
    case "NL": {
      const weights = [9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 8; i++) sum += digits[i] * weights[i];
      const mod11Ok = (sum - digits[8]) % 11 === 0;
      return { checked: true, valid: mod11Ok, algorithm: "NL-Elfproef-Mod-11" };
    }
    case "PL": {
      const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += digits[i] * weights[i];
      const check = sum % 11;
      return { checked: true, valid: check < 10 && check === digits[9], algorithm: "PL-NIP-Mod-11" };
    }
    case "PT": {
      if (![1, 2, 3, 5, 6, 7, 8, 9].includes(digits[0])) {
        return { checked: true, valid: false, algorithm: "PT-NIF-Mod-11" };
      }
      let sum = 0;
      for (let i = 0; i < 8; i++) sum += digits[i] * (9 - i);
      const rem = 11 - (sum % 11);
      const check = rem >= 10 ? 0 : rem;
      return { checked: true, valid: check === digits[8], algorithm: "PT-NIF-Mod-11" };
    }
    case "SE": {
      // Luhn on first 10 digits
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let v = digits[i] * (i % 2 === 0 ? 2 : 1);
        if (v > 9) v -= 9;
        sum += v;
      }
      const check = (10 - (sum % 10)) % 10;
      return { checked: true, valid: check === digits[9], algorithm: "SE-Orgnr-Luhn" };
    }
    default:
      return { checked: false, valid: true, algorithm: "Regex-Structural-Match" };
  }
}

export function validateEuVatNumber(rawVat) {
  const normalized = normalizeVatNumber(rawVat);
  if (!normalized || normalized.length < 4) {
    return {
      input: rawVat,
      normalized,
      valid: false,
      formatValid: false,
      checksumValid: false,
      reason: "VAT number is empty or shorter than 4 characters.",
      disclaimer: DISCLAIMER,
    };
  }

  const countryCode = normalized.slice(0, 2);
  const spec = EU_VAT_SPEC[countryCode];
  if (!spec) {
    return {
      input: rawVat,
      normalized,
      countryCode,
      valid: false,
      formatValid: false,
      checksumValid: false,
      reason: `Unsupported or non-EU VAT country prefix '${countryCode}'. Note: Greece uses 'EL' (auto-normalized from 'GR').`,
      disclaimer: DISCLAIMER,
    };
  }

  const formatValid = spec.regex.test(normalized);
  if (!formatValid) {
    return {
      input: rawVat,
      normalized,
      countryCode,
      countryName: spec.name,
      valid: false,
      formatValid: false,
      checksumValid: false,
      expectedFormat: spec.formatHint,
      reason: `Format mismatch for ${spec.name} (${countryCode}); expected ${spec.formatHint}.`,
      disclaimer: DISCLAIMER,
    };
  }

  const body = normalized.slice(2);
  const checksum = verifyCheckDigit(countryCode, body);
  const valid = formatValid && checksum.valid;

  return {
    input: rawVat,
    normalized,
    countryCode,
    countryName: spec.name,
    standardVatRatePercent: spec.standardRate,
    reducedVatRatesPercent: spec.reducedRates,
    formatValid,
    checksumChecked: checksum.checked,
    checksumAlgorithm: checksum.algorithm,
    checksumValid: checksum.valid,
    valid,
    reason: valid
      ? `Valid ${spec.name} (${countryCode}) VAT structure and ${checksum.algorithm} verification.`
      : `Failed ${checksum.algorithm} check-digit verification for ${spec.name} (${countryCode}).`,
    disclaimer: DISCLAIMER,
  };
}

export function evaluateEuB2bVatTreatment({
  supplierCountry,
  customerCountry,
  customerVatNumber,
  supplyType = "services",
  netAmountEUR = 1000,
}) {
  const sup = (supplierCountry || "").toUpperCase().trim() === "GR" ? "EL" : (supplierCountry || "").toUpperCase().trim();
  const cus = (customerCountry || "").toUpperCase().trim() === "GR" ? "EL" : (customerCountry || "").toUpperCase().trim();
  const net = Number(netAmountEUR);
  if (!Number.isFinite(net) || net < 0) {
    throw new Error("netAmountEUR must be a non-negative number.");
  }

  const supSpec = EU_VAT_SPEC[sup];
  if (!supSpec) {
    throw new Error(`Supplier country '${supplierCountry}' must be an EU Member State code (e.g., DE, FR, EL, NL).`);
  }

  const cusSpec = EU_VAT_SPEC[cus];
  const vatCheck = customerVatNumber ? validateEuVatNumber(customerVatNumber) : null;
  const hasValidBuyerVat = Boolean(vatCheck && vatCheck.valid && vatCheck.countryCode === cus);

  let regime = "";
  let vatRatePercent = 0;
  let directiveReference = "";
  let mandatoryInvoiceNote = "";

  if (sup === cus) {
    regime = "DOMESTIC_SUPPLY";
    vatRatePercent = supSpec.standardRate;
    directiveReference = "EU VAT Directive 2006/112/EC Title V (Domestic Place of Supply)";
    mandatoryInvoiceNote = `Domestic ${supSpec.name} supply — standard ${vatRatePercent}% VAT charged.`;
  } else if (!cusSpec) {
    regime = supplyType === "goods" ? "EXTRA_EU_EXPORT_GOODS" : "EXTRA_EU_B2B_SERVICES_OUTSIDE_SCOPE";
    vatRatePercent = 0;
    directiveReference =
      supplyType === "goods"
        ? "Article 146 EU VAT Directive 2006/112/EC (Export Exemption)"
        : "Article 44 EU VAT Directive 2006/112/EC (B2B General Rule — Place of Supply at Customer Location)";
    mandatoryInvoiceNote =
      supplyType === "goods"
        ? "Zero-rated extra-EU export of goods (Article 146 EU VAT Directive; customs export evidence required)."
        : "Outside scope of EU VAT — place of supply is customer's jurisdiction (Article 44 EU VAT Directive).";
  } else if (cus === "XI" && supplyType === "services") {
    regime = "EXTRA_EU_NI_SERVICES_OUTSIDE_SCOPE";
    vatRatePercent = 0;
    directiveReference = "Windsor Framework / Article 44 EU VAT Directive (XI Protocol applies to Goods only)";
    mandatoryInvoiceNote = "Northern Ireland (XI) Protocol covers goods only; B2B services follow extra-EU Article 44 rules.";
  } else if (hasValidBuyerVat) {
    if (supplyType === "goods") {
      regime = "INTRA_EU_EXEMPT_DISPATCH_GOODS";
      vatRatePercent = 0;
      directiveReference = "Article 138 EU VAT Directive 2006/112/EC (Exempt Intra-Community Supply of Goods)";
      mandatoryInvoiceNote = "Exempt intra-Community supply of goods — Article 138 of Council Directive 2006/112/EC (Reverse Charge).";
    } else {
      regime = "INTRA_EU_B2B_REVERSE_CHARGE_SERVICES";
      vatRatePercent = 0;
      directiveReference = "Article 44 & Article 196 EU VAT Directive 2006/112/EC (Mandatory B2B Reverse Charge)";
      mandatoryInvoiceNote = "Reverse Charge — VAT to be accounted for by the recipient pursuant to Article 44 and Article 196 of Council Directive 2006/112/EC.";
    }
  } else {
    regime = "INTRA_EU_NO_VALID_VAT_B2C_FALLBACK";
    vatRatePercent = cusSpec.standardRate;
    directiveReference = "Article 59c / OSS Union Scheme (No valid buyer EU VAT ID verified — treated as B2C destination rate)";
    mandatoryInvoiceNote = `No valid ${cusSpec.name} (${cus}) buyer VAT number verified; destination VAT (${vatRatePercent}%) applies under OSS rules.`;
  }

  const vatAmountEUR = Number(((net * vatRatePercent) / 100).toFixed(2));
  const grossAmountEUR = Number((net + vatAmountEUR).toFixed(2));

  return {
    supplierCountry: sup,
    supplierCountryName: supSpec.name,
    customerCountry: cus,
    customerCountryName: cusSpec ? cusSpec.name : "Non-EU / Third Country",
    supplyType,
    customerVatValidation: vatCheck,
    hasValidBuyerVat,
    regime,
    vatRatePercent,
    netAmountEUR: Number(net.toFixed(2)),
    vatAmountEUR,
    grossAmountEUR,
    directiveReference,
    mandatoryInvoiceNote,
    ecSalesListRequired: regime === "INTRA_EU_EXEMPT_DISPATCH_GOODS" || regime === "INTRA_EU_B2B_REVERSE_CHARGE_SERVICES",
    disclaimer: DISCLAIMER,
  };
}

export function auditInvoiceVatCompliance(invoice) {
  const issues = [];
  const warnings = [];

  if (!invoice || typeof invoice !== "object") {
    throw new Error("invoice object is required.");
  }

  const {
    invoiceNumber,
    issueDate,
    supplierName,
    supplierVatNumber,
    customerName,
    customerVatNumber,
    customerCountry,
    supplyType = "services",
    currency = "EUR",
    netAmount,
    vatRatePercent,
    vatAmount,
    grossAmount,
    invoiceNote = "",
  } = invoice;

  if (!invoiceNumber || String(invoiceNumber).trim().length === 0) {
    issues.push("Missing sequential invoiceNumber (Article 226(2) EU VAT Directive).");
  }
  if (!issueDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(issueDate))) {
    issues.push("Missing or invalid issueDate (expected YYYY-MM-DD per Article 226(1)).");
  }
  if (!supplierName || String(supplierName).trim().length < 2) {
    issues.push("Missing supplierName (Article 226(5)).");
  }
  if (!customerName || String(customerName).trim().length < 2) {
    issues.push("Missing customerName (Article 226(5)).");
  }

  const supVat = validateEuVatNumber(supplierVatNumber || "");
  if (!supVat.valid) {
    issues.push(`Invalid supplierVatNumber: ${supVat.reason}`);
  }

  const cusVat = customerVatNumber ? validateEuVatNumber(customerVatNumber) : null;
  if (customerVatNumber && !cusVat.valid) {
    issues.push(`Invalid customerVatNumber: ${cusVat.reason}`);
  }

  const resolvedCustomerCountry =
    customerCountry || (cusVat?.countryCode ? cusVat.countryCode : "");
  if (!resolvedCustomerCountry) {
    issues.push("Missing customerCountry (2-letter ISO code).");
  }

  const net = Number(netAmount);
  const rate = Number(vatRatePercent);
  const vat = Number(vatAmount);
  const gross = Number(grossAmount);

  if (!Number.isFinite(net) || net < 0) issues.push("netAmount must be a non-negative number.");
  if (!Number.isFinite(rate) || rate < 0) issues.push("vatRatePercent must be a non-negative number.");
  if (!Number.isFinite(vat) || vat < 0) issues.push("vatAmount must be a non-negative number.");
  if (!Number.isFinite(gross) || gross < 0) issues.push("grossAmount must be a non-negative number.");

  let expectedTreatment = null;
  if (supVat.valid && resolvedCustomerCountry && Number.isFinite(net) && net >= 0) {
    expectedTreatment = evaluateEuB2bVatTreatment({
      supplierCountry: supVat.countryCode,
      customerCountry: resolvedCustomerCountry,
      customerVatNumber,
      supplyType,
      netAmountEUR: net,
    });

    if (Math.abs(rate - expectedTreatment.vatRatePercent) > 0.01) {
      issues.push(
        `Applied vatRatePercent (${rate}%) does not match expected regime ${expectedTreatment.regime} rate (${expectedTreatment.vatRatePercent}%).`
      );
    }

    const expectedVat = Number(((net * rate) / 100).toFixed(2));
    if (Math.abs(vat - expectedVat) > 0.02) {
      issues.push(`Arithmetic mismatch: vatAmount (${vat}) != netAmount * ${rate}% (${expectedVat}).`);
    }

    const expectedGross = Number((net + vat).toFixed(2));
    if (Math.abs(gross - expectedGross) > 0.02) {
      issues.push(`Arithmetic mismatch: grossAmount (${gross}) != netAmount + vatAmount (${expectedGross}).`);
    }

    if (
      (expectedTreatment.regime === "INTRA_EU_B2B_REVERSE_CHARGE_SERVICES" ||
        expectedTreatment.regime === "INTRA_EU_EXEMPT_DISPATCH_GOODS") &&
      !/reverse charge|article 196|article 138|autoliquidaci|inversione contabile|steuerschuldnerschaft/i.test(invoiceNote)
    ) {
      issues.push(
        "Missing mandatory Reverse Charge / Article 196 / Article 138 reference in invoiceNote (Article 226(11a) EU VAT Directive)."
      );
    }
  }

  if (currency !== "EUR") {
    warnings.push(
      `Invoice currency is ${currency}; Article 230 EU VAT Directive requires the VAT amount to also be expressed in the national currency of the Member State (using ECB daily exchange rate).`
    );
  }

  return {
    compliant: issues.length === 0,
    issueCount: issues.length,
    warningCount: warnings.length,
    issues,
    warnings,
    expectedTreatment,
    en16931Ready: issues.length === 0,
    disclaimer: DISCLAIMER,
  };
}

export function batchValidateEuVatLedger({ vatNumbers = [], proLicenseKey = "" }) {
  if (!Array.isArray(vatNumbers) || vatNumbers.length === 0) {
    throw new Error("vatNumbers must be a non-empty array of strings.");
  }

  const effectiveKey = proLicenseKey || process.env.MCP_PRO_LICENSE_KEY || "";
  const isProUnlocked = /^PRO-[A-Z0-9]{8,}$/i.test(effectiveKey.trim());
  const freeBatchLimit = 5;

  if (vatNumbers.length > freeBatchLimit && !isProUnlocked) {
    return {
      proRequired: true,
      processedCount: freeBatchLimit,
      requestedCount: vatNumbers.length,
      message: `Free local tier processes up to ${freeBatchLimit} VAT numbers per batch call. Configure MCP_PRO_LICENSE_KEY ($19/mo at https://b2apps.lemonsqueezy.com/buy/eu-vat-vies-mcp-pro) to unlock unlimited ledger batch validation and remote Cloudflare Worker VIES verification.`,
      results: vatNumbers.slice(0, freeBatchLimit).map((v) => validateEuVatNumber(v)),
      disclaimer: DISCLAIMER,
    };
  }

  const results = vatNumbers.map((v) => validateEuVatNumber(v));
  const validCount = results.filter((r) => r.valid).length;

  return {
    proRequired: false,
    proActive: isProUnlocked,
    processedCount: results.length,
    validCount,
    invalidCount: results.length - validCount,
    results,
    disclaimer: DISCLAIMER,
  };
}
