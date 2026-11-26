import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  const categoryNames = new Map(categories.map(({ id, name }) => [id, name]));
  return (
    <section aria-label="Список задач">
      <h2>Задачи</h2>
      {tasks.length === 0 ? <p>Список задач пуст</p> : (
        <ul className="task-list">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} categoryName={categoryNames.get(task.categoryId)}
              onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
