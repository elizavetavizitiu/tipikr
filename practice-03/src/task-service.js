function error(message) {
  return { ok: false, error: message };
}

function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") {
    return error("Название должно быть строкой");
  }

  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return error("Длина названия должна быть от 1 до 100 символов");
  }

  return { ok: true, title: trimmed };
}

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return error("ID должен быть положительным безопасным целым числом");
  }

  const normalized = normalizeTitle(title);
  if (!normalized.ok) {
    return normalized;
  }

  if (!["low", "medium", "high"].includes(priority)) {
    return error("Приоритет должен быть low, medium или high");
  }

  return {
    ok: true,
    task: { id, title: normalized.title, completed: false, priority },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;

  return {
    total,
    completed,
    pending: total - completed,
    progress: total === 0 ? 0 : (completed / total) * 100,
  };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);
  if (!result.ok) {
    return result;
  }
  if (findTaskById(tasks, id)) {
    return error(`Задача с ID ${id} уже существует`);
  }
  return { ok: true, tasks: [...tasks, result.task] };
}

function checkTaskId(tasks, id) {
  if (!isValidId(id)) {
    return error("ID должен быть положительным безопасным целым числом");
  }
  if (!findTaskById(tasks, id)) {
    return error(`Задача с ID ${id} не найдена`);
  }
  return { ok: true };
}

export function setTaskCompleted(tasks, id, completed) {
  const result = checkTaskId(tasks, id);
  if (!result.ok) {
    return result;
  }
  if (typeof completed !== "boolean") {
    return error("Статус выполнения должен быть true или false");
  }

  return {
    ok: true,
    tasks: tasks.map((task) => task.id === id ? { ...task, completed } : task),
  };
}

export function renameTask(tasks, id, title) {
  const result = checkTaskId(tasks, id);
  if (!result.ok) {
    return result;
  }
  const normalized = normalizeTitle(title);
  if (!normalized.ok) {
    return normalized;
  }

  return {
    ok: true,
    tasks: tasks.map((task) =>
      task.id === id ? { ...task, title: normalized.title } : task
    ),
  };
}

export function removeTask(tasks, id) {
  const result = checkTaskId(tasks, id);
  if (!result.ok) {
    return result;
  }

  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
