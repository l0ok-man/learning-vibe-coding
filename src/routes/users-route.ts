import { Elysia } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    const result = await registerUser(body);
    if (result.error) {
      set.status = result.status || 400;
      return { data: result.message };
    }
    return { data: result.data };
  })
  .post("/login", async ({ body, set }) => {
    const result = await loginUser(body);
    if (result.error) {
      set.status = result.status || 400;
      return { data: result.message };
    }
    return { data: result.data };
  })
  .post("/users/current", async ({ headers, set }) => {
    const authorization = headers["authorization"];
    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "unauthorized" };
    }

    const token = authorization.substring(7);
    const result = await getCurrentUser(token);
    if (result.error) {
      set.status = result.status || 401;
      return { error: result.message };
    }
    return { data: result.data };
  });
