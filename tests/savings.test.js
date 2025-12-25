import request from "supertest";
import app from "../app.js";

describe("Savings Goal", () => {
  it("creates a goal", async () => {
    const res = await request(app)
      .post("/api/savings/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        targetAmount: 120000,
        durationDays: 180,
        frequency: "monthly",
        purpose: "Rent",
        startDate: "2025-12-27",
        primarySource: "WALLET"
      });

    expect(res.body.success).toBe(true);
  });

  it("blocks early withdrawal without OTP", async () => {
    const res = await request(app)
      .post("/api/savings/break/confirm")
      .send({ goalId, otp: "000000" });

    expect(res.status).toBe(400);
  });
});
