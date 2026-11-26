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
