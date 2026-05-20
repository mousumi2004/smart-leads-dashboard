import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { app } from "../app.js";
import { clearTestDb, closeTestDb, connectTestDb } from "./helpers/db.js";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(closeTestDb);

describe("backend e2e lead management flow", () => {
  test("runs the complete admin and sales workflow", async () => {
    const adminRegister = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin.e2e@example.com",
      password: "Password123!",
      role: "admin"
    });
    const salesRegister = await request(app).post("/api/auth/register").send({
      name: "Sales User",
      email: "sales.e2e@example.com",
      password: "Password123!",
      role: "sales"
    });
    const secondSalesRegister = await request(app).post("/api/auth/register").send({
      name: "Second Sales",
      email: "second.sales.e2e@example.com",
      password: "Password123!",
      role: "sales"
    });

    const adminToken = adminRegister.body.data.token as string;
    const salesToken = salesRegister.body.data.token as string;
    const secondSalesToken = secondSalesRegister.body.data.token as string;
    const salesUserId = salesRegister.body.data.user._id as string;

    expect(adminRegister.status).toBe(201);
    expect(salesRegister.status).toBe(201);
    expect(secondSalesRegister.status).toBe(201);

    for (let index = 1; index <= 12; index += 1) {
      const isQualifiedInstagram = index <= 3;
      const createResponse = await request(app)
        .post("/api/leads")
        .set("Authorization", `Bearer ${index % 2 === 0 ? adminToken : salesToken}`)
        .send({
          name: isQualifiedInstagram ? `Rahul Qualified ${index}` : `Lead ${index}`,
          email: `lead-${index}@example.com`,
          status: isQualifiedInstagram ? "Qualified" : index % 2 === 0 ? "Contacted" : "New",
          source: isQualifiedInstagram ? "Instagram" : index % 2 === 0 ? "Website" : "Referral"
        });

      expect(createResponse.status).toBe(201);
    }

    const followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const assignedLead = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Assigned Follow Up",
        email: "assigned.followup@example.com",
        status: "New",
        source: "Website",
        assignedTo: salesUserId,
        priority: "High",
        nextFollowUpAt: followUpDate,
        followUpType: "Call",
        followUpNote: "Call tomorrow about pricing"
      });

    expect(assignedLead.status).toBe(201);
    expect(assignedLead.body.data.assignedTo._id).toBe(salesUserId);

    const paginated = await request(app).get("/api/leads").set("Authorization", `Bearer ${adminToken}`);
    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toHaveLength(10);
    expect(paginated.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      totalRecords: 13,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false
    });

    const salesList = await request(app).get("/api/leads").set("Authorization", `Bearer ${salesToken}`);
    const secondSalesList = await request(app).get("/api/leads").set("Authorization", `Bearer ${secondSalesToken}`);
    expect(salesList.status).toBe(200);
    expect(salesList.body.data.some((lead: { email: string }) => lead.email === "assigned.followup@example.com")).toBe(true);
    expect(secondSalesList.status).toBe(200);
    expect(secondSalesList.body.data.some((lead: { email: string }) => lead.email === "assigned.followup@example.com")).toBe(false);

    const filtered = await request(app)
      .get("/api/leads")
      .query({ status: "Qualified", source: "Instagram", search: "Rahul", sort: "latest" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(filtered.status).toBe(200);
    expect(filtered.body.data).toHaveLength(3);

    const stats = await request(app).get("/api/leads/stats").set("Authorization", `Bearer ${salesToken}`);
    expect(stats.status).toBe(200);
    expect(stats.body.data.total).toBeGreaterThanOrEqual(1);
    expect(stats.body.data.Qualified).toBeGreaterThanOrEqual(1);

    const updated = await request(app)
      .put(`/api/leads/${assignedLead.body.data._id}`)
      .set("Authorization", `Bearer ${salesToken}`)
      .send({
        status: "Contacted",
        priority: "High",
        statusNote: "Called and scheduled a demo",
        nextFollowUpAt: followUpDate,
        followUpType: "Demo",
        followUpNote: "Prepare demo script"
      });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("Contacted");

    const activities = await request(app).get(`/api/leads/${assignedLead.body.data._id}/activities`).set("Authorization", `Bearer ${salesToken}`);
    expect(activities.status).toBe(200);
    expect(activities.body.data.map((activity: { type: string }) => activity.type)).toEqual(
      expect.arrayContaining(["lead_created", "assigned", "status_changed", "follow_up_scheduled"])
    );

    const note = await request(app)
      .post(`/api/leads/${assignedLead.body.data._id}/activities`)
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ note: "Customer wants a weekday demo." });
    expect(note.status).toBe(201);

    const followUps = await request(app).get("/api/leads/follow-ups").set("Authorization", `Bearer ${salesToken}`);
    expect(followUps.status).toBe(200);
    expect(followUps.body.data.some((lead: { email: string }) => lead.email === "assigned.followup@example.com")).toBe(true);

    const analytics = await request(app).get("/api/analytics").set("Authorization", `Bearer ${adminToken}`);
    expect(analytics.status).toBe(200);
    expect(analytics.body.data.byStatus.length).toBeGreaterThan(0);
    expect(analytics.body.data.bySource.length).toBeGreaterThan(0);

    const salesUsers = await request(app).get("/api/users/sales").set("Authorization", `Bearer ${adminToken}`);
    expect(salesUsers.status).toBe(200);
    expect(salesUsers.body.data.map((user: { email: string }) => user.email)).toEqual(
      expect.arrayContaining(["sales.e2e@example.com", "second.sales.e2e@example.com"])
    );

    const team = await request(app).get("/api/analytics/team").set("Authorization", `Bearer ${adminToken}`);
    expect(team.status).toBe(200);
    expect(
      team.body.data.some(
        (row: { user: { email: string }; assigned: number; reviewed: number; activityCount: number }) =>
          row.user.email === "sales.e2e@example.com" && row.assigned > 0 && row.reviewed > 0 && row.activityCount > 0
      )
    ).toBe(true);

    const salesExport = await request(app).get("/api/leads/export/csv").set("Authorization", `Bearer ${salesToken}`);
    expect(salesExport.status).toBe(403);

    const adminExport = await request(app)
      .get("/api/leads/export/csv")
      .query({ status: "Qualified", source: "Instagram", search: "Rahul" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminExport.status).toBe(200);
    expect(adminExport.text).toContain("Rahul Qualified");
    expect(adminExport.text).not.toContain("Lead 12");

    const leadId = paginated.body.data[0]._id as string;
    const salesDelete = await request(app).delete(`/api/leads/${leadId}`).set("Authorization", `Bearer ${salesToken}`);
    const adminDelete = await request(app).delete(`/api/leads/${leadId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(salesDelete.status).toBe(403);
    expect(adminDelete.status).toBe(200);
  });
});
