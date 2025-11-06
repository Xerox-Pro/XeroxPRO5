import { SearchForm } from "@/components/SearchForm";
import { ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <div className="text-center">
        <ShieldCheck className="w-24 h-24 text-blue-600 mx-auto mb-4" />
        <h1 className="text-5xl font-bold mb-2">Privacy Search</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          匿名性を保ちながらウェブを検索・閲覧
        </p>
      </div>
      <SearchForm />
    </main>
  );
}
