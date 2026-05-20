import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { app } from "../app.js";
import { clearTestDb, closeTestDb, connectTestDb } from "./helpers/db.js";
import { createLead, registerUser } from "./helpers/factories.js";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(closeTestDb);

describe("lead API", () => {
  test("creates, reads, updates, and lists leads with consistent response shape", async () => {
    const { token } = await registerUser({ role: "sales" });

    const created = await createLead(token, {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      status: "New",
      source: "Website"
    });
    const id = created.id;
    const read = await request(app).get(`/api/leads/${id}`).set("Authorization", `Bearer ${token}`);
    const updated = await request(app)
      .put(`/api/leads/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Qualified", source: "Referral" });
    const list = await request(app).get("/api/leads").set("Authorization", `Bearer ${token}`);

    expect(created.response.status).toBe(201);
    expect(created.response.body).toMatchObject({
      success: true,
      message: "Lead created",
      data: {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        status: "New",
        source: "Website",
        createdBy: expect.any(Object)
      }
    });
    expect(read.status).toBe(200);
    expect(read.body.data._id).toBe(id);
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("Qualified");
    expect(updated.body.data.source).toBe("Referral");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    });
  });

  test("filters by status/source/search, sorts latest/oldest, and paginates with default limit 10", async () => {
    const { token } = await registerUser({ role: "sales" });
    const leads = [
      ["Rahul Instagram", "rahul.instagram@example.com", "Qualified", "Instagram"],
      ["Rahul Referral", "rahul.referral@example.com", "Qualified", "Referral"],
      ["Nina Instagram", "nina@example.com", "New", "Instagram"],
      ["Amit Website", "amit@example.com", "Contacted", "Website"],
      ["Lost Lead", "lost@example.com", "Lost", "Website"],
      ["Extra 1", "extra1@example.com", "New", "Website"],
      ["Extra 2", "extra2@example.com", "New", "Website"],
      ["Extra 3", "extra3@example.com", "New", "Website"],
      ["Extra 4", "extra4@example.com", "New", "Website"],
      ["Extra 5", "extra5@example.com", "New", "Website"],
      ["Extra 6", "extra6@example.com", "New", "Website"],
      ["Extra 7", "extra7@example.com", "New", "Website"]
    ] as const;

    for (const [name, email, status, source] of leads) {
      await createLead(token, { name, email, status, source });
    }

    const filtered = await request(app)
      .get("/api/leads")
      .query({ status: "Qualified", source: "Instagram", search: "rahul", sort: "latest" })
      .set("Authorization", `Bearer ${token}`);
    const pageOne = await request(app).get("/api/leads").query({ sort: "oldest" }).set("Authorization", `Bearer ${token}`);
    const pageTwo = await request(app).get("/api/leads").query({ page: 2 }).set("Authorization", `Bearer ${token}`);

    expect(filtered.status).toBe(200);
    expect(filtered.body.data).toHaveLength(1);
    expect(filtered.body.data[0]).toMatchObject({ name: "Rahul Instagram", status: "Qualified", source: "Instagram" });
    expect(pageOne.body.data).toHaveLength(10);
    expect(pageOne.body.data[0].name).toBe("Rahul Instagram");
    expect(pageOne.body.meta).toMatchObject({ page: 1, limit: 10, totalRecords: 12, totalPages: 2, hasNextPage: true });
    expect(pageTwo.body.data).toHaveLength(2);
    expect(pageTwo.body.meta).toMatchObject({ page: 2, limit: 10, totalRecords: 12, totalPages: 2, hasPreviousPage: true });
  });

  test("returns lead status statistics", async () => {
    const { token } = await registerUser({ role: "sales" });
    await createLead(token, { status: "New" });
    await createLead(token, { status: "Contacted" });
    await createLead(token, { status: "Qualified" });
    await createLead(token, { status: "Qualified" });
    await createLead(token, { status: "Lost" });

    const response = await request(app).get("/api/leads/stats").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        total: 5,
        New: 1,
        Contacted: 1,
        Qualified: 2,
        Lost: 1
      }
    });
  });

  test("validates lead payloads and query values", async () => {
    const { token } = await registerUser({ role: "sales" });

    const createResponse = await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send({
      name: "",
      email: "bad-email",
      status: "Open",
      source: "Twitter"
    });
    const queryResponse = await request(app).get("/api/leads").query({ status: "Open", limit: 101 }).set("Authorization", `Bearer ${token}`);

    expect(createResponse.status).toBe(400);
    expect(createResponse.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "email" })]));
    expect(queryResponse.status).toBe(400);
    expect(queryResponse.body.success).toBe(false);
  });
});
