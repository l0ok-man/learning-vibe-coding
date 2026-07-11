import { Elysia } from "elysia";
import { registerUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    const result = await registerUser(body);
    if (result.error) {
      set.status = result.status || 400;
      return { data: result.message };
    }
    return { data: result.data };
  });
