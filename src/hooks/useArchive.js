import { useEffect, useState } from 'react';
import { fetchCollection, fetchFeaturedCharacters, fetchItem } from '../services/api.js';

export function useDebounced(value, milliseconds = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), milliseconds);
    return () => clearTimeout(timer);
  }, [value, milliseconds]);
  return debounced;
}

export function useCollection(type, { page = 1, name = '', limit = 12 } = {}) {
  const [state, setState] = useState({
    items: [],
    pages: 1,
    total: null,
    loading: true,
    error: '',
  });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: '' }));
    fetchCollection(type, { page, name, limit, signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setState({ ...result, loading: false, error: '' });
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setState((previous) => ({ ...previous, loading: false, error: err.message }));
      });
    return () => controller.abort();
  }, [type, page, name, limit, retry]);
  return { ...state, retry: () => setRetry((n) => n + 1) };
}

export function useItem(type, id) {
  const [state, setState] = useState({ item: null, loading: true, error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ item: null, loading: true, error: '' });
    fetchItem(type, id, { signal: controller.signal })
      .then((item) => {
        if (!controller.signal.aborted) setState({ item, loading: false, error: '' });
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setState({ item: null, loading: false, error: err.message });
      });
    return () => controller.abort();
  }, [type, id, retry]);
  return { ...state, retry: () => setRetry((n) => n + 1) };
}

export function useFeaturedCharacters() {
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ items: [], loading: true, error: '' });
    fetchFeaturedCharacters({ signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) setState({ items, loading: false, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ items: [], loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [retryCount]);

  return { ...state, retry: () => setRetryCount((count) => count + 1) };
}
