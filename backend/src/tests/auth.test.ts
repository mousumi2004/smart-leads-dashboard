import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { app } from "../app.js";
import { clearTestDb, closeTestDb, connectTestDb } from "./helpers/db.js";
import { registerUser } from "./helpers/factories.js";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(closeTestDb);

describe("auth API", () => {
  test("registers a user and returns a JWT plus safe user data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin"
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: "Registration successful",
      data: {
        token: expect.any(String),
        user: {
          name: "Admin User",
          email: "admin@example.com",
          role: "admin"
        }
      }
    });
    expect(response.body.data.user.password).toBeUndefined();
  });

  test("rejects duplicate registration emails", async () => {
    await registerUser({ email: "dupe@example.com" });

    const response = await request(app).post("/api/auth/register").send({
      name: "Duplicate",
      email: "dupe@example.com",
      password: "Password123!",
      role: "sales"
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      success: false,
      message: "Email is already registered"
    });
  });

  test("logs in with valid credentials and rejects invalid credentials", async () => {
    await registerUser({ email: "sales@example.com", password: "Password123!", role: "sales" });

    const success = await request(app).post("/api/auth/login").send({
      email: "sales@example.com",
      password: "Password123!"
    });
    const failure = await request(app).post("/api/auth/login").send({
      email: "sales@example.com",
      password: "wrong-password"
    });

    expect(success.status).toBe(200);
    expect(success.body.data.token).toEqual(expect.any(String));
    expect(success.body.data.user.role).toBe("sales");
    expect(failure.status).toBe(401);
    expect(failure.body).toMatchObject({ success: false, message: "Invalid email or password" });
  });

  test("returns the current user for a valid JWT and rejects missing JWTs", async () => {
    const { token } = await registerUser({ name: "Current User", email: "current@example.com" });

    const success = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    const failure = await request(app).get("/api/auth/me");

    expect(success.status).toBe(200);
    expect(success.body).toMatchObject({
      success: true,
      data: { email: "current@example.com", name: "Current User", role: "sales" }
    });
    expect(failure.status).toBe(401);
    expect(failure.body).toMatchObject({ success: false, message: "Authentication required" });
  });

  test("returns validation errors for invalid registration input", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "short",
      role: "owner"
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
        expect.objectContaining({ field: "role" })
      ])
    );
  });
});
