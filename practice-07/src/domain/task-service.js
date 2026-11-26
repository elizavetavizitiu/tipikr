export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (!title || title.length > 100) errors.title = "Введите название длиной от 1 до 100 символов.";
  const priority = draft?.priority;
  if (!["low", "medium", "high"].includes(priority)) errors.priority = "Выберите приоритет.";
  const raw = draft?.categoryId;
  const categoryId = typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw) : raw;
  if (!Number.isSafeInteger(categoryId) || !categories.some(({ id }) => id === categoryId)) {
    errors.categoryId = "Выберите существующую категорию.";
  }
  if (Object.keys(errors).length) return { valid: false, value: null, errors };
  return { valid: true, value: { title, priority, categoryId }, errors };
}

export function selectTasks(tasks, filters = {}) {
  const { completed = '', priority = '', categoryId = '', q = '' } = filters;
  const query = q.trim().toLowerCase();
  return tasks.filter(task =>
    (completed === '' || task.completed === (completed === 'true')) &&
    (!priority || task.priority === priority) &&
    (!categoryId || task.categoryId === Number(categoryId)) &&
    task.title.toLowerCase().includes(query)
  );
}

export function getTaskStats(tasks) {
  const completed = tasks.filter(task => task.completed).length;
  return { total: tasks.length, completed, active: tasks.length - completed };
}

export function addTask(tasks, value, id) {
  if (!Number.isSafeInteger(id) || id < 1 || tasks.some(task => task.id === id)) {
    throw new TypeError('Некорректный или повторяющийся ID.');
  }
  return [...tasks, { ...value, id, completed: false }];
}

export function updateTask(tasks, id, value) {
  const { title, priority, categoryId } = value;
  return tasks.map(task => task.id === id ? { ...task, title, priority, categoryId } : task);
}

export function toggleTask(tasks, id) {
  return tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
}

export function removeTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}
