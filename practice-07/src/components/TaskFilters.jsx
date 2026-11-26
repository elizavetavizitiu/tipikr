export default function TaskFilters({ filters, categories, onChange }) {
  const change = (name, value) => onChange({ ...filters, [name]: value });
  return (
    <section aria-label="Фильтры">
      <h2>Фильтры</h2>
      <div className="status-filters">
        {[['', 'Все'], ['false', 'В работе'], ['true', 'Завершенные']].map(([value, label]) => (
          <button key={value} type="button" aria-pressed={filters.completed === value}
            onClick={() => change('completed', value)}>{label}</button>
        ))}
      </div>
      <label>Поиск <input value={filters.q} onChange={e => change('q', e.target.value)} /></label>
      <label>Приоритет <select value={filters.priority} onChange={e => change('priority', e.target.value)}>
        <option value="">Все</option><option value="low">Низкий</option>
        <option value="medium">Средний</option><option value="high">Высокий</option>
      </select></label>
      <label>Категория <select value={filters.categoryId} onChange={e => change('categoryId', e.target.value)}>
        <option value="">Все</option>
        {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select></label>
      <button type="button" onClick={() => onChange({ q: '', completed: '', priority: '', categoryId: '' })}>Сбросить</button>
    </section>
  );
}
