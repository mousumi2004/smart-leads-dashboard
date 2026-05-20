import mongoose from "mongoose";
import { env } from "./env.js";
import type { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async () => {
  if (env.useMemoryDb) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const server = await MongoMemoryServer.create();
    memoryServer = server;
    await mongoose.connect(server.getUri());
    return;
  }

  await mongoose.connect(env.mongoUri);
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
