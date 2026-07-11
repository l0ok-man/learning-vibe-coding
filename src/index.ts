import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => ({ status: "ok", message: "Elysia server is running" }))
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error(error);
      return { error: "Database connection failed or table does not exist" };
    }
  })
  .post("/users", async ({ body }) => {
    try {
      const { name, email } = body as { name: string; email: string };
      if (!name || !email) {
        return { error: "Missing name or email" };
      }
      await db.insert(users).values({ name, email });
      return { success: true, message: "User created" };
    } catch (error) {
      console.error(error);
      return { error: "Failed to create user" };
    }
  });

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`🚀 Server is running at http://localhost:${port}`);
