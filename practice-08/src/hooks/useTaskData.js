import { useEffect, useRef, useState } from 'react';

export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const activeMutation = useRef(null);

  const { q, completed, priority, categoryId } = filters;
  useEffect(() => {
    const request = new AbortController();
    const currentFilters = { q, completed, priority, categoryId };
    setStatus('loading');
    setError(null);

    async function load() {
      try {
        const data = await api.loadInitialData(currentFilters, { signal: request.signal });
        if (request.signal.aborted) return;
        setSnapshot(data);
        setStatus('ready');
      } catch (error) {
        if (request.signal.aborted) return;
        setError(error);
        setStatus('error');
      }
    }

    void load();
    return () => request.abort();
  }, [api, q, completed, priority, categoryId, revision]);

  useEffect(() => () => activeMutation.current?.abort(), []);

  function refresh() {
    setRevision(previous => previous + 1);
  }

  async function mutate(operation) {
    if (activeMutation.current) return false;
    const request = new AbortController();
    activeMutation.current = request;
    setPending(true);
    setMutationError(null);
    try {
      await operation({ signal: request.signal });
      if (request.signal.aborted) return false;
      refresh();
      return true;
    } catch (error) {
      if (!request.signal.aborted) setMutationError(error);
      return false;
    } finally {
      activeMutation.current = null;
      if (!request.signal.aborted) setPending(false);
    }
  }

  return {
    snapshot, status, isLoading: status === 'loading', error, mutationError, pending, refresh,
    saveTask: (id, value) => mutate(options => id === null
      ? api.createTask(value, options) : api.updateTask(id, value, options)),
    toggleTask: task => mutate(options => api.setTaskCompleted(task.id, !task.completed, options)),
    deleteTask: id => mutate(options => api.deleteTask(id, options)),
    resetData: () => mutate(options => api.resetDemoData(options)),
  };
}
