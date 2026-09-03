import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const { seedIfEmpty } = await import("../src/lib/queries");
  await seedIfEmpty();
  console.log("Roteiro de Salvador pronto no MongoDB.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
