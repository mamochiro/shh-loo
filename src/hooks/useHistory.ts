'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Direction } from '@/lib/pasaloo';
import { storage } from '@/lib/utils';

export interface HistoryItem {
  src: string;
  out: string;
  dir: Direction;
}

const KEY = 'pasaloo:history';
const MAX = 20;

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]); // loaded after mount to keep SSR markup identical

  useEffect(() => {
    const saved = storage.get<HistoryItem[]>(KEY, []);
    if (Array.isArray(saved)) setItems(saved.slice(0, MAX));
  }, []);

  const add = useCallback((item: HistoryItem) => {
    if (!item.src.trim()) return;
    setItems((prev) => {
      const next = [item, ...prev.filter((x) => !(x.src === item.src && x.dir === item.dir))].slice(0, MAX);
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    storage.set(KEY, []);
  }, []);

  return { items, add, clear };
}
