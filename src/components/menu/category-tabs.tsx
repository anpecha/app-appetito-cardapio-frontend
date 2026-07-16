'use client';

import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-radius-full transition-colors duration-200 ${
              activeCategory === cat.id
                ? 'bg-action-primary text-text-on-brand shadow-button-primary'
                : 'bg-surface-card text-text-secondary border border-border-default hover:bg-surface-subtle'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
