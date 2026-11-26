import { ApiError } from './errors.js';

const priorities = ['low', 'medium', 'high'];

export function parsePositiveId(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

export function parseFilters(searchParams) {
  const filters = { completed: null, priority: null, categoryId: null, q: '' };
  const seen = new Set();
  for (const [key, value] of searchParams) {
    const invalid = () => new ApiError(400, 'INVALID_QUERY', `Недопустимый параметр ${key}.`);
    if (!Object.hasOwn(filters, key) || seen.has(key)) throw invalid();
    seen.add(key);
    if (key === 'completed') {
      if (value !== 'true' && value !== 'false') throw invalid();
      filters.completed = value === 'true';
    } else if (key === 'priority') {
      if (!priorities.includes(value)) throw invalid();
      filters.priority = value;
    } else if (key === 'categoryId') {
      filters.categoryId = parsePositiveId(value);
      if (filters.categoryId === null) throw invalid();
    } else {
      filters.q = value.trim();
      if (filters.q.length > 100) throw invalid();
    }
  }
  return filters;
}

export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft?.title === 'string' ? draft.title.trim() : '';
  if (title.length < 1 || title.length > 100) {
    errors.title = 'Название должно содержать от 1 до 100 символов.';
  }
  const priority = draft?.priority ?? 'medium';
  if (!priorities.includes(priority)) errors.priority = 'Недопустимый приоритет.';
  const categoryId = draft?.categoryId ?? categories[0]?.id;
  if (!categories.some(category => category.id === categoryId)) errors.categoryId = 'Категория не найдена.';
  if (Object.keys(errors).length) {
    throw new ApiError(400, 'INVALID_TASK', 'Проверьте поля задачи.', errors);
  }
  return { title, priority, categoryId };
}
