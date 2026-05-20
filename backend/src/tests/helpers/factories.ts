import request from "supertest";
import { app } from "../../app.js";

type Role = "admin" | "sales";

export const registerUser = async (overrides: Partial<{ name: string; email: string; password: string; role: Role }> = {}) => {
  const payload = {
    name: overrides.name ?? "Test User",
    email: overrides.email ?? `user-${Date.now()}-${Math.random()}@example.com`,
    password: overrides.password ?? "Password123!",
    role: overrides.role ?? "sales"
  };

  const response = await request(app).post("/api/auth/register").send(payload);
  return { response, payload, token: response.body.data?.token as string };
};

export const loginUser = async (email: string, password = "Password123!") => {
  const response = await request(app).post("/api/auth/login").send({ email, password });
  return { response, token: response.body.data?.token as string };
};

export const createLead = async (
  token: string,
  overrides: Partial<{ name: string; email: string; status: string; source: string }> = {}
) => {
  const payload = {
    name: overrides.name ?? "Rahul Sharma",
    email: overrides.email ?? `lead-${Date.now()}-${Math.random()}@example.com`,
    status: overrides.status ?? "New",
    source: overrides.source ?? "Website"
  };

  const response = await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send(payload);
  return { response, payload, id: response.body.data?._id as string };
};
