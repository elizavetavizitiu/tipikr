export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const rawId = draft?.id;
  const id = editingId ?? (typeof rawId === "string" && /^\d+$/.test(rawId.trim())
    ? Number(rawId) : rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    errors.id = "Введите положительный целый ID.";
  } else if (tasks.some((task) => task.id === id) !== (editingId !== null)) {
    errors.id = editingId === null ? "Задача с таким ID уже есть." : "Задача не найдена.";
  }

  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) {
    errors.title = "Введите название длиной от 1 до 100 символов.";
  }

  const priority = draft?.priority;
  if (!["low", "medium", "high"].includes(priority)) {
    errors.priority = "Выберите приоритет.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { id, title, priority } };
}
