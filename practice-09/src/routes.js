import express, { Router } from 'express';
import { ApiError } from './errors.js';
import { parseFilters, parsePositiveId, validateTaskDraft } from './validation.js';

export function createRouter(store) {
  const router = Router({ caseSensitive: true });
  router.get('/health', (req, res) => res.json({ data: { status: 'ok' } }));

  router.get('/categories', (req, res) => {
    const data = store.listCategories();
    res.json({ data, meta: { total: data.length } });
  });

  router.get('/tasks', (req, res) => {
    const { searchParams } = new URL(req.originalUrl, 'http://localhost');
    const filters = parseFilters(searchParams);
    const data = store.listTasks(filters);
    res.json({ data, meta: { total: data.length, filters } });
  });

  router.post('/tasks', express.json({ limit: '16kb' }), (req, res) => {
    const value = validateTaskDraft(req.body, store.listCategories());
    const task = store.createTask(value);
    res.location(`/api/tasks/${task.id}`).status(201).json({ data: task });
  });

  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (id === null) throw new ApiError(400, 'INVALID_ID', 'Некорректный ID.');
    const task = store.getTask(id);
    if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Задача не найдена.');
    res.json({ data: task });
  });

  for (const path of ['/health', '/categories', '/tasks', '/tasks/:id']) {
    const allowed = path === '/tasks' ? 'GET, HEAD, POST, OPTIONS' : 'GET, HEAD, OPTIONS';
    router.all(path, (req, res) => {
      res.set('Allow', allowed);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Метод не поддерживается.');
    });
  }
  return router;
}
