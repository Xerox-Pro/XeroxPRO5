'use client'

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };
  
  // ブラウザの戻る/進むボタンに対応するため
  useEffect(() => {
      setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="検索..."
        className="w-full px-5 py-3 text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        autoFocus
      />
      <button
        type="submit"
        aria-label="Search"
        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-full transition-colors"
      >
        <Search className="w-6 h-6" />
      </button>
    </form>
  );
}
