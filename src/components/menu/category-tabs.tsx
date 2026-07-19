'use client';

import type { Category } from '@/lib/types';
import { useRef, useEffect } from 'react';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeRef.current;
      const scrollLeft = button.offsetLeft - container.clientWidth / 2 + button.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(cat.id)}
            className={`
              shrink-0 px-4 py-2 rounded-full text-sm font-semibold
              transition-all duration-200
              ${
                isActive
                  ? 'bg-action-primary text-text-on-brand shadow-sm'
                  : 'bg-surface-card text-text-secondary border border-border-subtle hover:border-border-default'
              }
            `}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
