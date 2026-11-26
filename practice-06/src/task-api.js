import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Некорректные фильтры");
  const query = {};
  for (const [key, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(key)) throw new TypeError("Неизвестный фильтр");
    if (value === undefined) continue;
    if ((key === "completed" && typeof value !== "boolean")
      || (key === "priority" && !ALLOWED_PRIORITIES.has(value))
      || (key === "categoryId" && !isPositiveSafeInteger(value))
      || (key === "q" && (typeof value !== "string" || value.trim().length > 100))) throw new TypeError(`Некорректный фильтр ${key}`);
    if (key !== "q" || value.trim()) query[key] = key === "q" ? value.trim() : value;
  }
  return query;
}

function isList(data, valid) {
  return Array.isArray(data) && data.every(valid) && new Set(data.map(({ id }) => id)).size === data.length;
}

function taskPath(id) {
  if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный ID задачи");
  return `/tasks/${id}`;
}

function readTask(body) {
  if (!isTask(body?.data)) throw invalidResponse("Некорректная задача в ответе API");
  return body.data;
}

export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") throw new TypeError("Требуется API-клиент");

  async function getTasks(filters = {}, { signal } = {}) {
    const query = normalizeFilters(filters);
    const body = await client.requestJson("/tasks", { query, signal });
    if (!isList(body?.data, isTask) || body.meta?.total !== body.data.length) {
      throw invalidResponse("Некорректный список задач");
    }
    return { tasks: body.data, meta: body.meta };
  }

  async function getTaskById(id, { signal } = {}) {
    return readTask(await client.requestJson(taskPath(id), { signal }));
  }

  async function getCategories({ signal } = {}) {
    const body = await client.requestJson("/categories", { signal });
    if (!isList(body?.data, isCategory) || body.meta?.total !== body.data.length) {
      throw invalidResponse("Некорректный список категорий");
    }
    return body.data;
  }

  async function loadInitialData(filters, options) {
    const [result, categories] = await Promise.all([getTasks(filters, options), getCategories(options)]);
    return { ...result, categories };
  }

  async function createTask(draft, { signal } = {}) {
    return readTask(await client.requestJson("/tasks", { method: "POST", body: draft, signal }));
  }

  async function updateTask(id, changes, { signal } = {}) {
    return readTask(await client.requestJson(taskPath(id), { method: "PATCH", body: changes, signal }));
  }

  async function setTaskCompleted(id, completed, options) {
    if (typeof completed !== "boolean") throw new TypeError("Статус должен быть логическим");
    return updateTask(id, { completed }, options);
  }

  async function deleteTask(id, { signal } = {}) {
    const body = await client.requestJson(taskPath(id), { method: "DELETE", signal });
    if (body !== null) throw invalidResponse("Ожидался пустой ответ");
    return null;
  }

  async function resetDemoData({ signal } = {}) {
    const body = await client.requestJson("/debug/reset", { method: "POST", signal });
    if (body?.data?.reset !== true || !Number.isSafeInteger(body.data.total) || body.data.total < 0) {
      throw invalidResponse("Сброс данных не подтверждён");
    }
    return body.data;
  }

  return { getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask, setTaskCompleted, deleteTask, resetDemoData };
}
