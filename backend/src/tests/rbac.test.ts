import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { app } from "../app.js";
import { clearTestDb, closeTestDb, connectTestDb } from "./helpers/db.js";
import { createLead, registerUser } from "./helpers/factories.js";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(closeTestDb);

describe("lead RBAC and CSV export", () => {
  test("allows admins to delete leads and blocks sales users from deleting", async () => {
    const admin = await registerUser({ email: "admin@example.com", role: "admin" });
    const sales = await registerUser({ email: "sales@example.com", role: "sales" });
    const { id } = await createLead(admin.token, { email: "delete-me@example.com" });

    const salesDelete = await request(app).delete(`/api/leads/${id}`).set("Authorization", `Bearer ${sales.token}`);
    const adminDelete = await request(app).delete(`/api/leads/${id}`).set("Authorization", `Bearer ${admin.token}`);

    expect(salesDelete.status).toBe(403);
    expect(salesDelete.body).toMatchObject({ success: false, message: "Forbidden" });
    expect(adminDelete.status).toBe(200);
    expect(adminDelete.body).toMatchObject({ success: true, message: "Lead deleted" });
  });

  test("exports filtered CSV for admins and blocks sales users", async () => {
    const admin = await registerUser({ email: "admin@example.com", role: "admin" });
    const sales = await registerUser({ email: "sales@example.com", role: "sales" });
    await createLead(admin.token, {
      name: "Rahul Export",
      email: "rahul.export@example.com",
      status: "Qualified",
      source: "Instagram"
    });
    await createLead(admin.token, {
      name: "Other Export",
      email: "other.export@example.com",
      status: "New",
      source: "Website"
    });

    const salesExport = await request(app).get("/api/leads/export/csv").set("Authorization", `Bearer ${sales.token}`);
    const adminExport = await request(app)
      .get("/api/leads/export/csv")
      .query({ status: "Qualified", source: "Instagram", search: "Rahul" })
      .set("Authorization", `Bearer ${admin.token}`);

    expect(salesExport.status).toBe(403);
    expect(adminExport.status).toBe(200);
    expect(adminExport.headers["content-type"]).toContain("text/csv");
    expect(adminExport.text).toContain("Name,Email,Status,Source,Created At");
    expect(adminExport.text).toContain("Rahul Export,rahul.export@example.com,Qualified,Instagram");
    expect(adminExport.text).not.toContain("Other Export");
  });
});
