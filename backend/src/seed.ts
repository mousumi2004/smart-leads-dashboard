import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { seedDemoData } from "./dev/seedDemoData.js";
import { Lead } from "./models/Lead.js";
import { LeadActivity } from "./models/LeadActivity.js";
import { User } from "./models/User.js";

await connectDatabase();

await Promise.all([User.deleteMany({}), Lead.deleteMany({}), LeadActivity.deleteMany({})]);
await seedDemoData();

const totalLeads = await Lead.countDocuments();
console.log(`Seed complete with ${totalLeads} demo leads`);

await disconnectDatabase();
