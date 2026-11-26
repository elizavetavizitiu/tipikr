import { getTaskStats } from "./task-service.js";

const priorities = { low: "Низкий", medium: "Средний", high: "Высокий" };

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function actionButton(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.append(textElement("span", "action-label", label));
  return button;
}

export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.dataset.taskId = task.id;
  card.classList.toggle("is-completed", task.completed);

  const title = textElement("h3", "task-title", task.title);
  const status = textElement("span", "task-status", task.completed ? "Выполнена" : "В работе");
  const priority = textElement("span", "task-priority", priorities[task.priority]);
  const actions = document.createElement("div");
  actions.className = "task-actions";
  const toggle = actionButton("toggle", "Выполнена");
  toggle.setAttribute("aria-pressed", String(task.completed));
  actions.append(toggle, actionButton("delete", "Удалить"));
  card.append(title, status, priority, actions);
  return card;
}

export function renderTaskList(listElement, tasks) {
  listElement.replaceChildren(...tasks.map(createTaskElement));
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  const values = { total, completed, pending, progress: `${progress.toFixed(1)}%`, visible: visibleCount };
  for (const [name, value] of Object.entries(values)) {
    summaryElement.querySelector(`[data-stat="${name}"]`).textContent = value;
  }
}

export function renderEmptyState(messageElement, total, visibleCount) {
  messageElement.hidden = visibleCount > 0;
  if (visibleCount > 0) {
    messageElement.textContent = "";
  } else {
    messageElement.textContent = total === 0
      ? "Список задач пуст."
      : "Нет задач по выбранному фильтру.";
  }
}
