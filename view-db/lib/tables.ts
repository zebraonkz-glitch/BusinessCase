import { PrismaClient } from "@prisma/client";

export type ColumnInfo = {
  name: string;
  dataType: string;
  isNullable: boolean;
  hasDefault: boolean;
};

export type TableMeta = {
  columns: ColumnInfo[];
  primaryKey: string[];
};

const TABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

function assertTableName(table: string): void {
  if (!TABLE_NAME.test(table)) {
    throw new Error("Недопустимое имя таблицы");
  }
}

function quoteIdent(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error("Недопустимое имя колонки");
  }
  return `"${name}"`;
}

export async function listTables(client: PrismaClient): Promise<string[]> {
  const rows = await client.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '\\_prisma%' ESCAPE '\\'
    ORDER BY table_name
  `;

  return rows.map((r) => r.table_name);
}

export async function getTableMeta(
  client: PrismaClient,
  table: string,
): Promise<TableMeta> {
  assertTableName(table);

  const columns = await client.$queryRaw<
    {
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }[]
  >`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
    ORDER BY ordinal_position
  `;

  const pkRows = await client.$queryRaw<{ column_name: string }[]>`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = ${table}
      AND tc.constraint_type = 'PRIMARY KEY'
    ORDER BY kcu.ordinal_position
  `;

  if (columns.length === 0) {
    throw new Error(`Таблица «${table}» не найдена`);
  }

  return {
    columns: columns.map((c) => ({
      name: c.column_name,
      dataType: c.data_type,
      isNullable: c.is_nullable === "YES",
      hasDefault: c.column_default !== null,
    })),
    primaryKey: pkRows.map((r) => r.column_name),
  };
}

export async function countRows(
  client: PrismaClient,
  table: string,
): Promise<number> {
  assertTableName(table);
  const quoted = quoteIdent(table);
  const rows = await client.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM ${quoted}`,
  );
  return Number(rows[0]?.count ?? 0);
}

export async function fetchRows(
  client: PrismaClient,
  table: string,
  page: number,
  pageSize: number,
): Promise<Record<string, unknown>[]> {
  assertTableName(table);
  const meta = await getTableMeta(client, table);
  const orderCol = meta.primaryKey[0] ?? meta.columns[0]?.name;
  if (!orderCol) return [];

  const quotedTable = quoteIdent(table);
  const quotedOrder = quoteIdent(orderCol);
  const offset = (page - 1) * pageSize;

  return client.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM ${quotedTable} ORDER BY ${quotedOrder} LIMIT $1 OFFSET $2`,
    pageSize,
    offset,
  );
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  return value;
}

export function serializeRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = serializeValue(value);
  }
  return out;
}

export async function createRow(
  client: PrismaClient,
  table: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  assertTableName(table);
  const meta = await getTableMeta(client, table);
  const allowed = new Set(meta.columns.map((c) => c.name));
  const entries = Object.entries(data).filter(
    ([key, value]) => allowed.has(key) && value !== "" && value !== undefined,
  );

  if (entries.length === 0) {
    throw new Error("Нет данных для создания");
  }

  const cols = entries.map(([k]) => quoteIdent(k)).join(", ");
  const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");
  const values = entries.map(([, v]) => v);
  const quotedTable = quoteIdent(table);

  const rows = await client.$queryRawUnsafe<Record<string, unknown>[]>(
    `INSERT INTO ${quotedTable} (${cols}) VALUES (${placeholders}) RETURNING *`,
    ...values,
  );

  return serializeRow(rows[0] ?? {});
}

export async function updateRow(
  client: PrismaClient,
  table: string,
  pk: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  assertTableName(table);
  const meta = await getTableMeta(client, table);

  if (meta.primaryKey.length === 0) {
    throw new Error("У таблицы нет первичного ключа");
  }

  const allowed = new Set(meta.columns.map((c) => c.name));
  const pkSet = new Set(meta.primaryKey);
  const updates = Object.entries(data).filter(
    ([key, value]) => allowed.has(key) && !pkSet.has(key) && value !== undefined,
  );

  if (updates.length === 0) {
    throw new Error("Нет полей для обновления");
  }

  const values: unknown[] = [];
  let idx = 1;

  const setClause = updates
    .map(([key, value]) => {
      values.push(value === "" ? null : value);
      return `${quoteIdent(key)} = $${idx++}`;
    })
    .join(", ");

  const whereClause = meta.primaryKey
    .map((key) => {
      values.push(pk[key]);
      return `${quoteIdent(key)} = $${idx++}`;
    })
    .join(" AND ");

  const quotedTable = quoteIdent(table);
  const rows = await client.$queryRawUnsafe<Record<string, unknown>[]>(
    `UPDATE ${quotedTable} SET ${setClause} WHERE ${whereClause} RETURNING *`,
    ...values,
  );

  if (rows.length === 0) {
    throw new Error("Запись не найдена");
  }

  return serializeRow(rows[0]);
}

export async function deleteRow(
  client: PrismaClient,
  table: string,
  pk: Record<string, unknown>,
): Promise<void> {
  assertTableName(table);
  const meta = await getTableMeta(client, table);

  if (meta.primaryKey.length === 0) {
    throw new Error("У таблицы нет первичного ключа — удаление запрещено");
  }

  const values: unknown[] = [];
  let idx = 1;

  const whereClause = meta.primaryKey
    .map((key) => {
      values.push(pk[key]);
      return `${quoteIdent(key)} = $${idx++}`;
    })
    .join(" AND ");

  const quotedTable = quoteIdent(table);
  const rows = await client.$queryRawUnsafe<{ count: number }[]>(
    `DELETE FROM ${quotedTable} WHERE ${whereClause} RETURNING 1`,
    ...values,
  );

  if (rows.length === 0) {
    throw new Error("Запись не найдена");
  }
}
