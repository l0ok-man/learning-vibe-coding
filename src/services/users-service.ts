import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function registerUser(body: any) {
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return { error: true, status: 400, message: "Name, email, and password are required" };
  }

  // 1. Validasi Email Unik
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return { error: true, status: 400, message: "Email sudah terdaftar" };
  }

  // 2. Hashing Password menggunakan API bcrypt bawaan Bun
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // 3. Simpan Data
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Kembalikan Response Sukses
  return { success: true, data: "OK" };
}
