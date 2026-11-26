export function selectTasks(tasks, filters) {
  const { completed, priority, categoryId, q } = filters;
  return tasks.filter(task =>
    (completed === null || task.completed === completed) &&
    (priority === null || task.priority === priority) &&
    (categoryId === null || task.categoryId === categoryId) &&
    task.title.toLowerCase().includes(q.toLowerCase())
  );
}

export function findTask(tasks, id) {
  return tasks.find(task => task.id === id) ?? null;
}
