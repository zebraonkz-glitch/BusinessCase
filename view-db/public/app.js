const app = document.getElementById("app");
const errorBox = document.getElementById("error");
const subtitle = document.getElementById("subtitle");
const modalRoot = document.getElementById("modal-root");

const state = {
  db: null,
  table: null,
  page: 1,
  pageSize: 20,
};

function showError(message) {
  if (!message) {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
    return;
  }
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);

  if (parts.length === 0) return { view: "home" };
  if (parts.length === 1) return { view: "tables", db: parts[0] };
  if (parts.length === 3 && parts[1] === "table") {
    return { view: "table", db: parts[0], table: parts[2] };
  }
  return { view: "home" };
}

function navigate(path) {
  location.hash = path;
}

function renderHome(databases = []) {
  subtitle.textContent = "Выберите базу данных";
  app.innerHTML = `
    <div class="card-grid">
      ${databases
        .map(
          (db) => `
        <article class="card">
          <h2>${db.label}</h2>
          <p>${db.hint ?? (db.configured ? "Подключение настроено" : "URL не задан в .env")}</p>
          <button class="btn" data-db="${db.id}" ${db.configured ? "" : "disabled"}>
            Выбрать
          </button>
        </article>`,
        )
        .join("")}
    </div>
  `;

  app.querySelectorAll("[data-db]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`/${btn.dataset.db}`));
  });
}

function renderTables(db, tables = []) {
  subtitle.textContent = `База: ${db}`;
  app.innerHTML = `
    <div class="toolbar">
      <a href="#/">← К выбору БД</a>
    </div>
    <ul class="table-list">
      ${tables
        .map(
          (name) => `
        <li>
          <span>${name}</span>
          <button class="btn small" data-open="${name}">Открыть</button>
        </li>`,
        )
        .join("")}
    </ul>
  `;

  app.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`/${db}/table/${btn.dataset.open}`));
  });
}

function cellValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function openModal(title, fields, initial, onSubmit) {
  modalRoot.classList.remove("hidden");
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close>
      <form class="modal" id="modal-form">
        <h3>${title}</h3>
        <div class="form-grid">
          ${fields
            .map((field) => {
              const value = initial[field.name] ?? "";
              const readonly = field.readonly ? "readonly" : "";
              const required = !field.isNullable && !field.hasDefault && !field.readonly ? "required" : "";
              if (field.dataType.includes("text") && field.name !== "id") {
                return `
                  <label>
                    ${field.name}
                    <textarea name="${field.name}" ${readonly} ${required}>${value}</textarea>
                  </label>`;
              }
              return `
                <label>
                  ${field.name}
                  <input name="${field.name}" value="${value}" ${readonly} ${required} />
                </label>`;
            })
            .join("")}
        </div>
        <div class="modal-actions">
          <button type="button" class="btn secondary" data-cancel>Отмена</button>
          <button type="submit" class="btn">Сохранить</button>
        </div>
      </form>
    </div>
  `;

  const close = () => {
    modalRoot.classList.add("hidden");
    modalRoot.innerHTML = "";
  };

  modalRoot.querySelector("[data-cancel]").addEventListener("click", close);
  modalRoot.querySelector("[data-close]").addEventListener("click", (event) => {
    if (event.target.dataset.close !== undefined && event.target === event.currentTarget) {
      close();
    }
  });

  modalRoot.querySelector("#modal-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      await onSubmit(payload);
      close();
    } catch (error) {
      showError(error.message);
    }
  });
}

function renderTableView(db, table, meta, payload) {
  subtitle.textContent = `${db} → ${table}`;
  const columns = (meta?.columns ?? []).map((c) => c.name);
  const pk = meta?.primaryKey ?? [];
  const rows = payload?.rows ?? [];

  app.innerHTML = `
    <div class="toolbar">
      <a href="#/${db}">← К таблицам</a>
      <button class="btn" id="create-btn">Создать</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${columns.map((c) => `<th>${c}</th>`).join("")}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => {
              const pkData = Object.fromEntries(pk.map((k) => [k, row[k]]));
              return `
              <tr data-pk='${JSON.stringify(pkData).replace(/'/g, "&#39;")}'>
                ${columns.map((c) => `<td title="${cellValue(row[c])}">${cellValue(row[c])}</td>`).join("")}
                <td class="actions">
                  <button class="btn small secondary" data-edit>Изменить</button>
                  <button class="btn small danger" data-delete>Удалить</button>
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button class="btn secondary small" id="prev-page" ${payload.page <= 1 ? "disabled" : ""}>Назад</button>
      <span>Стр. ${payload.page} из ${payload.totalPages} · всего ${payload.total}</span>
      <button class="btn secondary small" id="next-page" ${payload.page >= payload.totalPages ? "disabled" : ""}>Вперёд</button>
    </div>
  `;

  document.getElementById("create-btn").addEventListener("click", () => {
    openModal("Создать запись", meta?.columns ?? [], {}, async (data) => {
      await api(`/api/${db}/tables/${table}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      await loadTable(db, table, state.page);
    });
  });

  app.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tr = btn.closest("tr");
      const pkData = JSON.parse(tr.dataset.pk);
      const row = rows.find((r) => pk.every((k) => String(r[k]) === String(pkData[k])));
      const fields = (meta?.columns ?? []).map((c) => ({
        ...c,
        readonly: pk.includes(c.name),
      }));

      openModal("Изменить запись", fields, row, async (data) => {
        await api(`/api/${db}/tables/${table}`, {
          method: "PUT",
          body: JSON.stringify({ pk: pkData, data }),
        });
        await loadTable(db, table, state.page);
      });
    });
  });

  app.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tr = btn.closest("tr");
      const pkData = JSON.parse(tr.dataset.pk);
      if (!confirm("Удалить запись?")) return;
      try {
        await api(`/api/${db}/tables/${table}`, {
          method: "DELETE",
          body: JSON.stringify({ pk: pkData }),
        });
        await loadTable(db, table, state.page);
      } catch (error) {
        showError(error.message);
      }
    });
  });

  document.getElementById("prev-page")?.addEventListener("click", () => {
    loadTable(db, table, state.page - 1);
  });

  document.getElementById("next-page")?.addEventListener("click", () => {
    loadTable(db, table, state.page + 1);
  });
}

async function loadTable(db, table, page) {
  state.db = db;
  state.table = table;
  state.page = page;
  showError("");

  const [meta, payload] = await Promise.all([
    api(`/api/${db}/tables/${table}/meta`),
    api(`/api/${db}/tables/${table}?page=${page}&pageSize=${state.pageSize}`),
  ]);

  renderTableView(db, table, meta, payload);
}

async function render() {
  showError("");
  const route = parseRoute();

  try {
    if (route.view === "home") {
      const { databases } = await api("/api/databases");
      renderHome(databases);
      return;
    }

    if (route.view === "tables") {
      const { tables } = await api(`/api/${route.db}/tables`);
      renderTables(route.db, tables);
      return;
    }

    if (route.view === "table") {
      await loadTable(route.db, route.table, state.page);
    }
  } catch (error) {
    showError(error.message);
    app.innerHTML = `<p><a href="#/">← На главную</a></p>`;
  }
}

window.addEventListener("hashchange", render);
render();
