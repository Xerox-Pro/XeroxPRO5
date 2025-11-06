import { Eye } from "lucide-react";
import React from "react";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResultItemProps {
  result: SearchResult;
}

// Fix: Changed component to be a React.FC to correctly handle the special `key` prop and resolve the TypeScript error.
export const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(result.url)}`;

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
      <a href={result.url} target="_blank" rel="noopener noreferrer">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 hover:underline">
          {result.title}
        </h2>
        <p className="text-sm text-green-700 dark:text-green-500 truncate">{result.url}</p>
      </a>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{result.snippet}</p>
      <div className="mt-3">
        <a
          href={proxyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          <Eye className="w-4 h-4" />
          匿名で表示
        </a>
      </div>
    </div>
  );
};
