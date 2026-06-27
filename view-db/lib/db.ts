import { PrismaClient } from "@prisma/client";

export type DbTarget = "local" | "work";

const clients = new Map<DbTarget, PrismaClient>();

function isPlaceholderUrl(url: string): boolean {
  return (
    url.includes("USER:PASSWORD") ||
    url.includes("@localhost:5432/businesscase")
  );
}

export function getDbUrl(target: DbTarget): string {
  if (target === "local") {
    const local = process.env.DATABASE_URL_LOCAL?.trim();
    if (local && !isPlaceholderUrl(local)) {
      return local;
    }
    if (!local) {
      return process.env.DATABASE_URL?.trim() ?? "";
    }
    return "";
  }

  const work =
    process.env.DATABASE_URL_WORK?.trim() ??
    process.env.WORK_DATABASE_URL?.trim();
  if (work && !isPlaceholderUrl(work)) {
    return work;
  }

  return process.env.DATABASE_URL?.trim() ?? "";
}

export function isDbConfigured(target: DbTarget): boolean {
  const url = getDbUrl(target);
  return Boolean(url) && !isPlaceholderUrl(url);
}

export function getDbLabel(target: DbTarget): string {
  if (target === "local") {
    const local = process.env.DATABASE_URL_LOCAL?.trim();
    if (local && !isPlaceholderUrl(local)) {
      return "Локальная БД";
    }
    if (!local && process.env.DATABASE_URL) {
      return "Локальная БД (DATABASE_URL)";
    }
    return "Локальная БД";
  }

  if (
    (process.env.DATABASE_URL_WORK && !isPlaceholderUrl(process.env.DATABASE_URL_WORK)) ||
    (process.env.WORK_DATABASE_URL && !isPlaceholderUrl(process.env.WORK_DATABASE_URL))
  ) {
    return "Рабочая БД";
  }

  return "Рабочая БД (DATABASE_URL)";
}

export function getDbHint(target: DbTarget): string {
  if (isDbConfigured(target)) {
    return "Подключение настроено";
  }

  if (target === "local") {
    return "Задайте DATABASE_URL_LOCAL или уберите placeholder localhost из .env";
  }

  return "Задайте DATABASE_URL_WORK в .env";
}

export function getClient(target: DbTarget): PrismaClient {
  const url = getDbUrl(target);
  if (!url) {
    throw new Error(
      target === "local"
        ? "Локальная БД не настроена. Укажите DATABASE_URL_LOCAL или удалите placeholder localhost:5432 из .env"
        : "Рабочая БД не настроена. Укажите DATABASE_URL_WORK в .env",
    );
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
