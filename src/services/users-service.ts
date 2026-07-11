import { db } from "../db";
import { users, sessions } from "../db/schema";
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

export async function loginUser(body: any) {
  const { email, password } = body;

  if (!email || !password) {
    return { error: true, status: 400, message: "Email atau password salah" };
  }

  // 1. Cari User berdasarkan Email
  const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userList.length === 0) {
    return { error: true, status: 400, message: "Email atau password salah" };
  }

  const user = userList[0];

  // 2. Verifikasi Password menggunakan bcrypt bawaan Bun
  const isPasswordValid = await Bun.password.verify(password, user.password);
  if (!isPasswordValid) {
    return { error: true, status: 400, message: "Email atau password salah" };
  }

  // 3. Generate Token Session (UUID) & Simpan Data
  const token = crypto.randomUUID();
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // 4. Kembalikan Response Sukses (Token)
  return { success: true, data: token };
}

export async function getCurrentUser(token: string) {
  if (!token) {
    return { error: true, status: 401, message: "unauthorized" };
  }

  // 1. Cari Session & Join dengan Users
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (result.length === 0) {
    return { error: true, status: 401, message: "unauthorized" };
  }

  // 2. Kembalikan data user
  return { success: true, data: result[0] };
}

export async function logoutUser(token: string) {
  if (!token) {
    return { error: true, status: 401, message: "unauthorized" };
  }

  // 1. Cari Session terlebih dahulu (Dialect Agnostic)
  const sessionList = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (sessionList.length === 0) {
    return { error: true, status: 401, message: "unauthorized" };
  }

  // 2. Hapus Session jika ditemukan
  await db.delete(sessions).where(eq(sessions.token, token));

  return { success: true, data: "OK" };
}
