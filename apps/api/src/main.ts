import "dotenv/config";
import { createApp } from "./bootstrap.js";
async function main() {
  const app = await createApp();
  await app.listen(
    Number(process.env.PORT) || 4000,
    process.env.HOST || "127.0.0.1",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
