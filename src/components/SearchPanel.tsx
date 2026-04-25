import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import type { ProcessSearchResult } from '../types/process';

type SearchScope = 'all' | 'current';

interface SearchPanelProps {
  isOpen: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  results: ProcessSearchResult[];
  activeProcessTitle: string;
  onSelectResult: (result: ProcessSearchResult) => void;
  onClose: () => void;
}

const MATCH_LABELS: Record<ProcessSearchResult['matchType'], string> = {
  node: 'Node',
  edge: 'Edge',
  process: 'Process',
  sla: 'SLA',
};

export default function SearchPanel({
  isOpen,
  query,
  onQueryChange,
  scope,
  onScopeChange,
  results,
  activeProcessTitle,
  onSelectResult,
  onClose,
}: SearchPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [results, query, isOpen]);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, ProcessSearchResult[]>();
    for (const result of results) {
      const list = groups.get(result.processKey) ?? [];
      list.push(result);
      groups.set(result.processKey, list);
    }
    return Array.from(groups.entries()).map(([processKey, list]) => ({
      processKey,
      processTitle: list[0].processTitle,
      processIcon: list[0].processIcon,
      items: list,
    }));
  }, [results]);

  const flatResults = useMemo(
    () => groupedResults.flatMap(group => group.items),
    [groupedResults],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (flatResults.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(prev => (prev + 1) % flatResults.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = flatResults[activeIndex];
      if (selected) {
        onSelectResult(selected);
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onKeyDown={handleKeyDown}>
      <div className="rc-card w-full max-w-4xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col" role="dialog" aria-modal="true" aria-label="Search across processes">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--rc-primary-900)]">Search Processes</h2>
            <p className="text-xs text-gray-600 font-asap mt-0.5">Find nodes, process metadata, edge labels, and SLA targets</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search panel"
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-4 border-b border-[var(--rc-primary-100)] space-y-3">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Search nodes, process details, edges, SLA..."
            aria-label="Search all processes"
            className="w-full px-3 py-2 rounded-lg border border-[var(--rc-primary-100)] bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
          />

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-[var(--rc-primary-100)] overflow-hidden">
              <button
                type="button"
                onClick={() => onScopeChange('all')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  scope === 'all'
                    ? 'bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)]'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Processes
              </button>
              <button
                type="button"
                onClick={() => onScopeChange('current')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-[var(--rc-primary-100)] ${
                  scope === 'current'
                    ? 'bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)]'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Current Only
              </button>
            </div>

            <p className="text-xs text-gray-500 font-asap">
              {scope === 'all' ? `Searching all processes` : `Searching ${activeProcessTitle}`}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500 font-asap">
              Start typing to search across processes.
            </div>
          ) : results.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500 font-asap">
              No matches found. Try a different keyword.
            </div>
          ) : (
            <div className="space-y-4">
              {groupedResults.map(group => (
                <div key={group.processKey} className="rc-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{group.processIcon}</span>
                    <p className="text-sm font-semibold text-[var(--rc-primary-900)]">{group.processTitle}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--rc-primary-50)] border border-[var(--rc-primary-100)] text-[var(--rc-primary-900)]">
                      {group.items.length} match{group.items.length > 1 ? 'es' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map(item => {
                      runningIndex += 1;
                      const isActive = runningIndex === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectResult(item)}
                          className={`search-result-item w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            isActive
                              ? 'active border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)]'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.matchText}</p>
                            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              {MATCH_LABELS[item.matchType]}
                            </span>
                          </div>
                          {item.contextText && (
                            <p className="text-xs text-gray-500 mt-0.5 font-asap">{item.contextText}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
