export const STORAGE_VERSION = 1;

export function isValidTaskList(tasks) {
  if (!Array.isArray(tasks)) return false;
  const ids = new Set();
  for (const task of tasks) {
    if (!task || !Number.isSafeInteger(task.id) || task.id <= 0 || ids.has(task.id)
      || typeof task.title !== "string" || task.title !== task.title.trim()
      || task.title.length < 1 || task.title.length > 100
      || typeof task.completed !== "boolean"
      || !["low", "medium", "high"].includes(task.priority)) return false;
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const copy = (tasks) => tasks.map((task) => ({ ...task }));
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: copy(fallbackTasks) };

    const payload = JSON.parse(raw);
    if (payload?.version !== STORAGE_VERSION || !isValidTaskList(payload.tasks)) {
      throw new Error("неверный формат данных");
    }
    return { ok: true, source: "storage", tasks: copy(payload.tasks) };
  } catch (error) {
    return { ok: false, source: "fallback", tasks: copy(fallbackTasks), error: `Не удалось прочитать localStorage: ${error.message}` };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) return { ok: false, error: "Некорректный список задач." };
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить задачи: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сбросить данные: ${error.message}` };
  }
}
