#!/usr/bin/env node
/**
 * @b2apps/eu-vat-vies-mcp — Model Context Protocol (MCP) JSON-RPC 2.0 stdio server.
 * Handles initialize, notifications/initialized, ping, tools/list, and tools/call.
 * Educational & technical compliance planning tool only; not financial, tax, or legal advice.
 */
import readline from "node:readline";
import {
  validateEuVatNumber,
  evaluateEuB2bVatTreatment,
  auditInvoiceVatCompliance,
  batchValidateEuVatLedger,
} from "./vat-engine.mjs";

export const SERVER_INFO = {
  name: "eu-vat-vies-mcp",
  version: "1.0.0",
};

export const TOOLS = [
  {
    name: "validate_eu_vat_number",
    description:
      "Validate an EU Member State (or Northern Ireland XI) VAT identification number offline using country-specific structure and mathematical check-digit algorithms (ISO 7064, Luhn, Mod-11, Mod-97). Returns normalized VAT ID, country standard/reduced VAT rates, and check-digit result.",
    inputSchema: {
      type: "object",
      properties: {
        vatNumber: {
          type: "string",
          description: "Full EU VAT number including 2-letter country prefix (e.g., 'DE123456788', 'EL094014201', 'NL004495445B01').",
        },
      },
      required: ["vatNumber"],
    },
  },
  {
    name: "evaluate_eu_b2b_vat_treatment",
    description:
      "Determine the exact EU VAT treatment (Domestic, Intra-EU B2B Reverse Charge under Article 44/196, Intra-EU Exempt Goods Dispatch under Article 138, Extra-EU Export, or OSS B2C Fallback), VAT rate, net/VAT/gross EUR amounts, EC Sales List requirement, and mandatory EU VAT Directive invoice wording.",
    inputSchema: {
      type: "object",
      properties: {
        supplierCountry: {
          type: "string",
          description: "2-letter EU country prefix of the supplier (e.g., 'DE', 'EL', 'FR', 'NL').",
        },
        customerCountry: {
          type: "string",
          description: "2-letter ISO/VAT country prefix of the customer (e.g., 'FR', 'IT', 'US', 'GB', 'XI').",
        },
        customerVatNumber: {
          type: "string",
          description: "Optional buyer EU VAT number to verify B2B status for Reverse Charge / Zero-rating.",
        },
        supplyType: {
          type: "string",
          enum: ["services", "goods"],
          description: "Whether the supply is cross-border 'services' (Article 44/196) or physical 'goods' (Article 138/146).",
        },
        netAmountEUR: {
          type: "number",
          description: "Net invoice amount in EUR before VAT.",
        },
      },
      required: ["supplierCountry", "customerCountry", "netAmountEUR"],
    },
  },
  {
    name: "audit_invoice_vat_compliance",
    description:
      "Audit an EU B2B/B2C invoice object against Council Directive 2006/112/EC (Article 226) and EN 16931 e-invoicing rules. Verifies supplier/customer VAT numbers, applied VAT rate, arithmetic accuracy, and mandatory Reverse Charge invoice notes.",
    inputSchema: {
      type: "object",
      properties: {
        invoiceNumber: { type: "string", description: "Unique sequential invoice number." },
        issueDate: { type: "string", description: "Invoice issue date in YYYY-MM-DD format." },
        supplierName: { type: "string", description: "Legal name of supplier." },
        supplierVatNumber: { type: "string", description: "Supplier EU VAT number." },
        customerName: { type: "string", description: "Legal name of customer." },
        customerVatNumber: { type: "string", description: "Customer EU VAT number (if B2B)." },
        customerCountry: { type: "string", description: "Customer 2-letter country code." },
        supplyType: { type: "string", enum: ["services", "goods"] },
        currency: { type: "string", description: "3-letter ISO currency code (default 'EUR')." },
        netAmount: { type: "number", description: "Net taxable amount." },
        vatRatePercent: { type: "number", description: "Applied VAT rate percentage." },
        vatAmount: { type: "number", description: "Calculated VAT amount." },
        grossAmount: { type: "number", description: "Total gross payable amount." },
        invoiceNote: { type: "string", description: "Exemption / Reverse Charge legal text printed on the invoice." },
      },
      required: [
        "invoiceNumber",
        "issueDate",
        "supplierName",
        "supplierVatNumber",
        "customerName",
        "customerCountry",
        "netAmount",
        "vatRatePercent",
        "vatAmount",
        "grossAmount",
      ],
    },
  },
  {
    name: "batch_validate_eu_vat_ledger",
    description:
      "Batch-validate an array of EU VAT numbers for ERP/accounting ledger hygiene. Free local tier validates up to 5 VAT IDs per call; Pro tier (via MCP_PRO_LICENSE_KEY) unlocks unlimited batch sizes.",
    inputSchema: {
      type: "object",
      properties: {
        vatNumbers: {
          type: "array",
          items: { type: "string" },
          description: "Array of EU VAT numbers to validate.",
        },
        proLicenseKey: {
          type: "string",
          description: "Optional Pro license key (or set MCP_PRO_LICENSE_KEY in env).",
        },
      },
      required: ["vatNumbers"],
    },
  },
];

export function handleJsonRpcRequest(msg) {
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id: msg?.id ?? null,
      error: { code: -32600, message: "Invalid JSON-RPC 2.0 request" },
    };
  }

  // Notifications have no id and expect no response
  if (msg.id === undefined) {
    return null;
  }

  const { id, method, params = {} } = msg;

  try {
    switch (method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: params.protocolVersion || "2024-11-05",
            capabilities: {
              tools: { listChanged: false },
            },
            serverInfo: SERVER_INFO,
          },
        };

      case "ping":
        return {
          jsonrpc: "2.0",
          id,
          result: {},
        };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: TOOLS,
          },
        };

      case "tools/call": {
        const toolName = params?.name;
        const args = params?.arguments || {};
        let payload;

        switch (toolName) {
          case "validate_eu_vat_number":
            if (!args.vatNumber || typeof args.vatNumber !== "string") {
              throw new Error("Missing required string argument 'vatNumber'.");
            }
            payload = validateEuVatNumber(args.vatNumber);
            break;

          case "evaluate_eu_b2b_vat_treatment":
            payload = evaluateEuB2bVatTreatment(args);
            break;

          case "audit_invoice_vat_compliance":
            payload = auditInvoiceVatCompliance(args);
            break;

          case "batch_validate_eu_vat_ledger":
            payload = batchValidateEuVatLedger(args);
            break;

          default:
            return {
              jsonrpc: "2.0",
              id,
              error: { code: -32601, message: `Unknown tool: ${toolName}` },
            };
        }

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(payload, null, 2),
              },
            ],
            isError: false,
          },
        };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: err instanceof Error ? err.message : String(err),
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      },
    };
  }
}

// Start stdio listener when executed directly
const isMain =
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").slice(-2).join("/"));

if (isMain) {
  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });

  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        }) + "\n"
      );
      return;
    }

    const res = handleJsonRpcRequest(parsed);
    if (res) {
      process.stdout.write(JSON.stringify(res) + "\n");
    }
  });
}
