const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  return (
    <li className="task" data-task-id={task.id} data-completed={task.completed}>
      <h3>{task.title}</h3>
      <p>{task.completed ? 'Выполнена' : 'В работе'} · {priorityLabels[task.priority]} · {categoryName}</p>
      <button type="button" onClick={() => onToggle(task.id)}>Изменить статус</button>
      <button type="button" onClick={() => onEdit(task.id)}>Редактировать</button>
      <button type="button" onClick={() => onDelete(task.id)}>Удалить</button>
    </li>
  );
}
