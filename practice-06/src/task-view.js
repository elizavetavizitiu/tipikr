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

export function createTaskElement(task, category) {
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
  actions.append(toggle, actionButton("edit", "Редактировать"), actionButton("delete", "Удалить"));
  card.append(title, status, priority, textElement("span", "task-category", category?.name ?? "Без категории"), actions);
  return card;
}

export function renderTaskList(listElement, tasks, categories) {
  listElement.replaceChildren(...tasks.map((task) => createTaskElement(task, categories.find(({ id }) => id === task.categoryId))));
}

