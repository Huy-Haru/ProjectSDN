const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pagination, range } = require("../src/services/adminService");

test("admin pagination bounds and timezone date validation", () => {
  assert.deepEqual(pagination({ page: "2", limit: "10" }), {
    page: 2,
    limit: 10,
    skip: 10,
  });
  for (const input of [
    { page: "-1" },
    { page: "1.5" },
    { limit: "101" },
    { limit: "0" },
  ])
    assert.throws(() => pagination(input));
  const paid = range({ from: "2026-10-23", to: "2026-10-23" }, "paidAt").paidAt;
  assert.equal(paid.$gte.toISOString(), "2026-10-22T17:00:00.000Z");
  assert.equal(paid.$lt.toISOString(), "2026-10-23T17:00:00.000Z");
  const booking = range({ from: "2026-10-23" }, "date", false).date;
  assert.equal(booking.$gte.toISOString(), "2026-10-23T00:00:00.000Z");
  for (const input of [
    { from: "2026-02-30" },
    { from: "bad" },
    { from: "2026-11-01", to: "2026-10-01" },
  ])
    assert.throws(() => range(input, "paidAt"));
});
