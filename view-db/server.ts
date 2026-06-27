import express from "express";
import path from "path";
import { config } from "dotenv";
import {
  DbTarget,
  disconnectAll,
  getClient,
  getDbLabel,
  getDbUrl,
  isValidDbTarget,
  isValidTableName,
} from "./lib/db";
import {
  countRows,
  createRow,
  deleteRow,
  fetchRows,
  getTableMeta,
  listTables,
  serializeRow,
  updateRow,
} from "./lib/tables";

config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = Number(process.env.VIEW_DB_PORT ?? 3847);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function parseDb(param: string): DbTarget {
  if (!isValidDbTarget(param)) {
    throw new Error("Неверный параметр БД");
  }
  return param;
}

app.get("/api/databases", (_req, res) => {
  const targets: DbTarget[] = ["local", "work"];
  res.json(
    targets.map((id) => ({
      id,
      label: getDbLabel(id),
      configured: Boolean(getDbUrl(id)),
    })),
  );
});

app.get("/api/:db/tables", async (req, res) => {
  try {
    const db = parseDb(req.params.db);
    const client = getClient(db);
    const tables = await listTables(client);
    res.json({ tables });
  } catch (error) {
    res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
  }
});

app.get("/api/:db/tables/:name/meta", async (req, res) => {
  try {
    const db = parseDb(req.params.db);
    const table = req.params.name;
    if (!isValidTableName(table)) {
      res.status(400).json({ error: "Недопустимое имя таблицы" });
      return;
    }
    const client = getClient(db);
    const meta = await getTableMeta(client, table);
    res.json(meta);
  } catch (error) {
    res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
  }
});

app.get("/api/:db/tables/:name", async (req, res) => {
  try {
    const db = parseDb(req.params.db);
    const table = req.params.name;
    if (!isValidTableName(table)) {
      res.status(400).json({ error: "Недопустимое имя таблицы" });
      return;
    }

    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));

    const client = getClient(db);
    const [total, rows] = await Promise.all([
      countRows(client, table),
      fetchRows(client, table, page, pageSize),
    ]);

    res.json({
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      rows: rows.map((row) => serializeRow(row)),
    });
  } catch (error) {
    res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
  }
});

app.post("/api/:db/tables/:name", async (req, res) => {
  try {
    const db = parseDb(req.params.db);
    const table = req.params.name;
    if (!isValidTableName(table)) {
      res.status(400).json({ error: "Недопустимое имя таблицы" });
      return;
    }

    const client = getClient(db);
    const row = await createRow(client, table, req.body ?? {});
    res.status(201).json({ row });
  } catch (error) {
    res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
  }
});

app.put("/api/:db/tables/:name", async (req, res) => {
  try {
    const db = parseDb(req.params.db);
    const table = req.params.name;
    if (!isValidTableName(table)) {
      res.status(400).json({ error: "Недопустимое имя таблицы" });
      return;
    }

    const { pk, data } = req.body ?? {};
    if (!pk || !data) {
      res.status(400).json({ error: "Нужны pk и data" });
      return;
    }

    const client = getClient(db);
    const row = await updateRow(client, table, pk, data);
    res.json({ row });
  } catch (error) {
    res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
  }
});

app.delete("/api/:db/tables/:name", async (req, res) => {
  try {
    const db = parseDb(req.params.db);
    const table = req.params.name;
    if (!isValidTableName(table)) {
      res.status(400).json({ error: "Недопустимое имя таблицы" });
      return;
    }

    const pk = req.body?.pk;
    if (!pk) {
      res.status(400).json({ error: "Нужен pk" });
      return;
    }

    const client = getClient(db);
    await deleteRow(client, table, pk);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`view-db: http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await disconnectAll();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  await disconnectAll();
  server.close(() => process.exit(0));
});
