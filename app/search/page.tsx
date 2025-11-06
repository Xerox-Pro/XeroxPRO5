import { SearchForm } from "@/components/SearchForm";
import { SearchResultItem, SearchResult } from "@/components/SearchResultItem";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";

const DUMMY_RESULTS: SearchResult[] = [
  {
    title: "Next.js by Vercel - The React Framework for the Web",
    url: "https://nextjs.org/",
    snippet: "Used by some of the world's largest companies, Next.js enables you to create full-stack Web applications by extending the latest React features...",
  },
  {
    title: "Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.",
    url: "https://tailwindcss.com/",
    snippet: "A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.",
  },
  {
    title: "Vercel: Develop. Preview. Ship.",
    url: "https://vercel.com/",
    snippet: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
  },
  {
    title: "JSDOM - A JavaScript based headless browser that can be used to scrape and interact with web pages.",
    url: "https://github.com/jsdom/jsdom",
    snippet: "jsdom is a pure-JavaScript implementation of many web standards, notably the WHATWG DOM and HTML Standards, for use with Node.js.",
  },
  {
    title: "Lucide - Beautiful & consistent icons",
    url: "https://lucide.dev/",
    snippet: "A community-maintained fork of Feather Icons. Lucide is an open-source icon library with over 1000 vector icons. It's built with simplicity and consistency in mind.",
  },
];

function SearchPageContent() {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
        <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl hidden sm:inline">Privacy Search</span>
            </Link>
            <div className="flex-grow">
              <SearchForm />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            約 5 件のダミー結果
          </p>
          <div className="space-y-6">
            {DUMMY_RESULTS.map((result, index) => (
              <SearchResultItem key={index} result={result} />
            ))}
          </div>
        </main>
      </div>
    );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
