// Run: node --test src/utils/assistanceRows.test.js
import assert from "node:assert/strict";
import test from "node:test";
import { buildAssistanceRows } from "./assistanceRows.js";

const profiles = [
  { id: "a", full_name: "Ana", barangay: "Poblacion" },
  { id: "b", full_name: "Ben", barangay: "Sabud" }, // no records at all
];
const byPwd = new Map([
  [
    "a",
    [
      {
        status: "received",
        quantity: 2,
        received_at: "2026-03-04T00:00:00Z",
        receipt_number: "RCPT-2026-1234abcd",
        announcement: { subsidy_type: "Medical Assistance", item_type: "Wheelchair" },
      },
      {
        status: "pending",
        quantity: 1,
        announcement: { subsidy_type: "Financial Assistance", item_type: "Cash (₱500)" },
      },
    ],
  ],
]);

test("PWDs with no assistance produce no rows", () => {
  const rows = buildAssistanceRows(profiles, byPwd);
  assert.equal(rows.length, 2);
  assert.ok(!rows.some((r) => r.name === "Ben"));
  assert.deepEqual([...new Set(rows.map((r) => r.status))].sort(), [
    "Claimed",
    "Unclaimed",
  ]);
});

test("subsidy filter keeps only that category", () => {
  const rows = buildAssistanceRows(profiles, byPwd, "Financial Assistance");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].item, "Cash (₱500)");
  assert.equal(rows[0].status, "Unclaimed");
  assert.equal(rows[0].detail, ""); // unclaimed rows carry no receipt
});

test("status filter keeps only claimed or only unclaimed", () => {
  const claimed = buildAssistanceRows(profiles, byPwd, "all", undefined, "claimed");
  assert.deepEqual(claimed.map((r) => r.status), ["Claimed"]);

  const unclaimed = buildAssistanceRows(profiles, byPwd, "all", undefined, "unclaimed");
  assert.deepEqual(unclaimed.map((r) => r.status), ["Unclaimed"]);

  // stacks with the subsidy filter
  assert.equal(
    buildAssistanceRows(profiles, byPwd, "Medical Assistance", undefined, "unclaimed")
      .length,
    0
  );
});

test("claimed rows carry date and receipt; municipality comes from the resolver", () => {
  const rows = buildAssistanceRows(profiles, byPwd, "all", () => "Loreto");
  const claimed = rows.find((r) => r.status === "Claimed");
  assert.equal(claimed.municipality, "Loreto");
  assert.equal(claimed.subsidy, "Medical Assistance");
  assert.equal(claimed.qty, 2);
  assert.match(claimed.detail, /RCPT-2026-1234abcd$/);
});
