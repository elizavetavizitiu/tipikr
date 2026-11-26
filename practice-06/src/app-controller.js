import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (typeof api?.loadInitialData !== "function" || typeof view?.setListState !== "function") {
    throw new TypeError("Требуются API и представление");
  }
  let tasks = [];
  let categories = null;
  let filters = {};
  let editingId = null;
  let activeLoad;
  let activeMutation;
  let destroyed = false;

  async function refresh() {
    if (destroyed) return;
    activeLoad?.abort();
    const request = new AbortController();
    activeLoad = request;
    view.setListState("loading");
    try {
      const options = { signal: request.signal };
      const result = categories === null
        ? await api.loadInitialData(filters, options)
        : await api.getTasks(filters, options);
      if (activeLoad !== request || request.signal.aborted) return;
      if (result.categories) {
        categories = result.categories;
        view.setCategories(categories);
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
      if (activeMutation) view.setMutationPending(true);
    } catch (error) {
      if (activeLoad === request && !request.signal.aborted && error.kind !== "aborted") {
        view.setListState("error", messageForError(error));
      }
    }
  }

  function applyFilters(value = {}) {
    filters = { ...value };
    return refresh();
  }

  function cancelEdit() {
    editingId = null;
    view.showFormErrors({});
    view.setFormTask(null);
  }

  function beginEdit(id) {
    const task = tasks.find((entry) => entry.id === id);
    if (!task) return;
    editingId = id;
    view.showFormErrors({});
    view.setFormTask(task);
  }

  async function mutate(operation, message, afterSuccess) {
    if (destroyed || activeMutation) return;
    const request = new AbortController();
    activeMutation = request;
    view.setMutationPending(true);
    try {
      await operation({ signal: request.signal });
      if (destroyed) return;
      afterSuccess?.();
      await refresh();
      if (!destroyed) view.notify(message, "success");
    } catch (error) {
      if (!destroyed && error.kind !== "aborted") view.notify(messageForError(error), "error");
    } finally {
      activeMutation = undefined;
      if (!destroyed) view.setMutationPending(false);
    }
  }

  async function submit(draft) {
    const { valid, value, errors } = validateDraft(draft, categories ?? []);
    view.showFormErrors(errors);
    if (!valid) return;
    const id = editingId;
    return mutate(
      (options) => id === null ? api.createTask(value, options) : api.updateTask(id, value, options),
      id === null ? "Задача добавлена." : "Задача обновлена.",
      cancelEdit,
    );
  }

  function toggleTask(id) {
    const task = tasks.find((entry) => entry.id === id);
    if (!task) return;
    return mutate(
      (options) => api.setTaskCompleted(id, !task.completed, options),
      "Статус задачи изменён.",
    );
  }

  function deleteTask(id) {
    return mutate((options) => api.deleteTask(id, options), "Задача удалена.", () => {
      if (editingId === id) cancelEdit();
    });
  }

  function resetData() {
    return mutate((options) => api.resetDemoData(options), "Исходные данные восстановлены.", cancelEdit);
  }

  function destroy() {
    destroyed = true;
    activeLoad?.abort();
    activeMutation?.abort();
  }

  return { start: applyFilters, applyFilters, refresh, submit, beginEdit, cancelEdit, toggleTask, deleteTask, resetData, destroy };
}
