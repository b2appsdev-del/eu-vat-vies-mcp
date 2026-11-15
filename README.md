# EU VAT, VIES & B2B Reverse-Charge Compliance Auditor MCP (`@b2apps/eu-vat-vies-mcp`)

Deterministic **Model Context Protocol (MCP)** server for **EU VAT number check-digit verification**, **intra-EU B2B Reverse-Charge evaluation (Articles 44, 138 & 196 of Council Directive 2006/112/EC)**, and **EN 16931 invoice compliance auditing**.

Built for AI coding and finance agents in **Claude Desktop, Cursor, Windsurf, VS Code Copilot, and Antigravity**.

---

## Why Use This MCP Server?

LLMs frequently hallucinate national VAT check-digit rules, confuse Greece's `EL` prefix with ISO `GR`, or apply domestic VAT to cross-border intra-EU B2B supplies where **Article 196 Reverse Charge** is mandatory. `@b2apps/eu-vat-vies-mcp` gives your agent a **100% deterministic calculation and validation engine**:

1. **`validate_eu_vat_number`** — Offline structure + mathematical check-digit verification (`ISO 7064 Mod 11,10` for Germany, `Mod-11 Pow2` for Greece `EL`, `Elfproef Mod-11` for Netherlands, `Mod-97` for Belgium/France, `Luhn` for Italy/Sweden, `NIP/NIF Mod-11` for Poland/Portugal, etc.) across all 27 EU Member States + Northern Ireland (`XI`).
2. **`evaluate_eu_b2b_vat_treatment`** — Computes the exact VAT regime (`DOMESTIC_SUPPLY`, `INTRA_EU_B2B_REVERSE_CHARGE_SERVICES`, `INTRA_EU_EXEMPT_DISPATCH_GOODS`, `EXTRA_EU_EXPORT_GOODS`, `EXTRA_EU_B2B_SERVICES_OUTSIDE_SCOPE`, or `INTRA_EU_NO_VALID_VAT_B2C_FALLBACK`), net/VAT/gross EUR figures, EC Sales List flag, and mandatory invoice legal text.
3. **`audit_invoice_vat_compliance`** — Audits an invoice JSON payload against **Article 226 of EU VAT Directive 2006/112/EC** and **EN 16931**, flagging missing sequential numbers, invalid VAT IDs, rate mismatches, rounding errors, or missing Reverse Charge clauses.
4. **`batch_validate_eu_vat_ledger`** — Batch-validates arrays of EU VAT numbers for ERP/accounting ledger cleanup.

---

## Quick Start & Client Configuration (`mcpServers`)

### Claude Desktop / Cursor / Windsurf (`claude_desktop_config.json` or `.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "eu-vat-vies": {
      "command": "npx",
      "args": ["-y", "@b2apps/eu-vat-vies-mcp"],
      "env": {
        "MCP_PRO_LICENSE_KEY": ""
      }
    }
  }
}
```

### Smithery CLI

```bash
npx -y @smithery/cli install @b2apps/eu-vat-vies-mcp --client claude
```

---

## Network, Telemetry & Billing Disclosure

- **100% Offline Local Execution (`stdio`)**: All 4 tools included in the local `stdio` server run completely offline on your machine. **Zero external network requests, zero telemetry, and zero logging of your invoice or VAT data.**
- **Free MIT Core vs. Pro License Tier (`$19/mo`)**:
  - **Free Tier (`$0`, MIT)**: Unlimited calls to `validate_eu_vat_number`, `evaluate_eu_b2b_vat_treatment`, `audit_invoice_vat_compliance`, and `batch_validate_eu_vat_ledger` (up to 5 VAT IDs per batch call).
  - **Pro Tier (`$19/mo` via LemonSqueezy)**: Setting `MCP_PRO_LICENSE_KEY` unlocks unlimited batch ledger validation and access to the managed remote Cloudflare Worker Streamable HTTP gateway (`https://b2apps.lemonsqueezy.com/buy/eu-vat-vies-mcp-pro`).

---

## Mandatory Disclaimer

> **Disclaimer**: *Educational & technical compliance planning tool only; does not constitute financial, tax, legal, or accounting advice.* VAT rules depend on specific transaction facts, permanent establishment status, and national transpositions of Council Directive 2006/112/EC. Always consult a qualified tax advisor or chartered accountant before filing VAT returns or issuing tax invoices.
