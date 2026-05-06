import { describe, expect, it } from "vitest";

import {
  getOrderStatusLabel,
  getOrderStatusVariant,
  getOutcomeTagLabel,
  getOutcomeTagVariant,
} from "@/constants/orderStatus";

describe("orderStatus mappings", () => {
  it("maps known order statuses to labels", () => {
    expect(getOrderStatusLabel("ship_approved")).toBe("Ship approved");
    expect(getOrderStatusLabel("pending_verification")).toBe("Pending verification");
    expect(getOrderStatusLabel("verifying")).toBe("Verifying");
  });

  it("falls back to the raw value for unknown statuses", () => {
    expect(getOrderStatusLabel("totally_unknown")).toBe("totally_unknown");
    expect(getOrderStatusVariant("totally_unknown")).toBe("secondary");
  });

  it("maps known order statuses to badge variants", () => {
    expect(getOrderStatusVariant("ship_approved")).toBe("success");
    expect(getOrderStatusVariant("cancelled")).toBe("destructive");
    expect(getOrderStatusVariant("address_correction_requested")).toBe("warning");
  });

  it("returns null label for empty outcome and a label for known ones", () => {
    expect(getOutcomeTagLabel(null)).toBeNull();
    expect(getOutcomeTagLabel(undefined)).toBeNull();
    expect(getOutcomeTagLabel("")).toBeNull();
    expect(getOutcomeTagLabel("confirmed")).toBe("Confirmed");
  });

  it("maps outcome tags to badge variants", () => {
    expect(getOutcomeTagVariant("confirmed")).toBe("success");
    expect(getOutcomeTagVariant("cancel_requested")).toBe("destructive");
    expect(getOutcomeTagVariant(null)).toBe("secondary");
  });
});
