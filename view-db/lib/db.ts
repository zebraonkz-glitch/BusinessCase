import { PrismaClient } from "@prisma/client";

export type DbTarget = "local" | "work";

const clients = new Map<DbTarget, PrismaClient>();

export function getDbUrl(target: DbTarget): string {
  if (target === "local") {
    return (
      process.env.DATABASE_URL_LOCAL ??
      process.env.DATABASE_URL ??
      ""
    );
  }

  return (
    process.env.DATABASE_URL_WORK ??
    process.env.WORK_DATABASE_URL ??
    process.env.DATABASE_URL ??
    ""
  );
}

export function getDbLabel(target: DbTarget): string {
  if (target === "local") {
    return process.env.DATABASE_URL_LOCAL
      ? "Локальная БД"
      : "Локальная БД (DATABASE_URL)";
  }

  return process.env.DATABASE_URL_WORK || process.env.WORK_DATABASE_URL
    ? "Рабочая БД"
    : "Рабочая БД (DATABASE_URL)";
}

export function getClient(target: DbTarget): PrismaClient {
  const url = getDbUrl(target);
  if (!url) {
    throw new Error(`URL для БД «${target}» не задан`);
  }

  if (!clients.has(target)) {
    clients.set(
      target,
      new PrismaClient({
        datasources: { db: { url } },
        log: ["error"],
      }),
    );
  }

  return clients.get(target)!;
}

export async function disconnectAll(): Promise<void> {
  await Promise.all([...clients.values()].map((c) => c.$disconnect()));
  clients.clear();
}

export function isValidDbTarget(value: string): value is DbTarget {
  return value === "local" || value === "work";
}

export function isValidTableName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}
