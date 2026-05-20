import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { app } from "./app.js";
import { seedDemoData } from "./dev/seedDemoData.js";

await connectDatabase();
if (env.useMemoryDb) {
  await seedDemoData();
}

app.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port}`);
});
