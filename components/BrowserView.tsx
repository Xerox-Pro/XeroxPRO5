import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Shortcut, HistoryItem, Settings, AccentColor, UiCornerRadius } from '../types';
import HomeScreen from './HomeScreen';

// --- Type Definitions ---
interface Tab {
  id: string;
  url: string;
  title: string;
  isLoading: boolean;
  favicon: string | null;
  isGoogle: boolean;
  history: {
    canGoBack: boolean;
    canGoForward: boolean;
  };
}

// --- Icons ---
const PlusIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" /></svg>);
const CloseIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>);
const ReloadIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.943 13.093A8.995 8.995 0 0112 21a9 9 0 01-9-9 9 9 0 019-9c2.59 0 4.934 1.09 6.585 2.842m1.358 2.158L21 11m-4-2v4" /></svg>);
const ArrowLeftIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>);
const ArrowRightIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>);
const MenuIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>);
const LockIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const GlobeIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.7 9.3l.16-.64A20.01 20.01 0 0112 5c2.4 0 4.7.4 6.84.97l.16.64M7.7 9.3A20.01 20.01 0 0012 19c2.4 0 4.7-.4 6.84-1.03M7.7 9.3l-.16.64A20.01 20.01 0 0012 19c-2.4 0-4.7-.4-6.84-1.03l-.16-.64" /></svg>);


// --- Constants ---
const ACCENT_COLOR_MAP: Record<AccentColor, { focus: string; bg: string; text: string; hover: string; ring: string; border: string; }> = {
    indigo: { focus: 'focus:ring-indigo-500', bg: 'bg-indigo-600', text: 'text-indigo-600', hover: 'hover:bg-indigo-700', ring: 'ring-indigo-500', border: 'border-indigo-500' },
    sky: { focus: 'focus:ring-sky-500', bg: 'bg-sky-600', text: 'text-sky-600', hover: 'hover:bg-sky-700', ring: 'ring-sky-500', border: 'border-sky-500' },
    emerald: { focus: 'focus:ring-emerald-500', bg: 'bg-emerald-600', text: 'text-emerald-600', hover: 'hover:bg-emerald-700', ring: 'ring-emerald-500', border: 'border-emerald-500' },
    rose: { focus: 'focus:ring-rose-500', bg: 'bg-rose-600', text: 'text-rose-600', hover: 'hover:bg-rose-700', ring: 'ring-rose-500', border: 'border-rose-500' },
    amber: { focus: 'focus:ring-amber-500', bg: 'bg-amber-600', text: 'text-amber-600', hover: 'hover:bg-amber-700', ring: 'ring-amber-500', border: 'border-amber-500' },
    violet: { focus: 'focus:ring-violet-500', bg: 'bg-violet-600', text: 'text-violet-600', hover: 'hover:bg-violet-700', ring: 'ring-violet-500', border: 'border-violet-500' },
    cyan: { focus: 'focus:ring-cyan-500', bg: 'bg-cyan-600', text: 'text-cyan-600', hover: 'hover:bg-cyan-700', ring: 'ring-cyan-500', border: 'border-cyan-500' },
    slate: { focus: 'focus:ring-slate-500', bg: 'bg-slate-600', text: 'text-slate-600', hover: 'hover:bg-slate-700', ring: 'ring-slate-500', border: 'border-slate-500' },
};
const CORNER_RADIUS_MAP: Record<UiCornerRadius, { main: string; large: string, full: string }> = {
    sharp: { main: 'rounded-none', large: 'rounded-sm', full: 'rounded-none' },
    standard: { main: 'rounded-md', large: 'rounded-lg', full: 'rounded-full' },
    rounded: { main: 'rounded-xl', large: 'rounded-2xl', full: 'rounded-full' },
    pills: { main: 'rounded-full', large: 'rounded-3xl', full: 'rounded-full' },
};
const NEW_TAB_URL = 'x-new-tab://';
const GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=';
const isGoogleUrl = (url: string) => /^(https?:\/\/)?(www\.)?google\.com/.test(url);

interface BrowserViewProps {
  onNavigate: (url: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  shortcuts: Shortcut[];
  addShortcut: (shortcut: Omit<Shortcut, 'id' | 'iconUrl'>) => void;
  deleteShortcut: (id: string) => void;
  history: HistoryItem[];
  clearHistory: () => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

// --- Main Component ---
const BrowserView: React.FC<BrowserViewProps> = (props) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [omniboxValue, setOmniboxValue] = useState('');
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  const accent = ACCENT_COLOR_MAP[props.settings.accentColor];
  const radius = CORNER_RADIUS_MAP[props.settings.uiCornerRadius];
  
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);

  const handleNewTab = useCallback(() => {
    const newTab: Tab = {
      id: `tab_${Date.now()}`,
      url: NEW_TAB_URL,
      title: '新しいタブ',
      isLoading: false,
      favicon: null,
      isGoogle: false,
      history: { canGoBack: false, canGoForward: false },
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  useEffect(() => {
    if (tabs.length === 0) handleNewTab();
  }, [tabs.length, handleNewTab]);

  useEffect(() => {
    setOmniboxValue(activeTab?.url === NEW_TAB_URL ? '' : activeTab?.url || '');
  }, [activeTab]);

  const handleNavigate = useCallback((url: string, tabId: string) => {
    const isSearch = !/^(https?:\/\/|localhost)/.test(url) || !url.includes('.');
    
    let finalUrl = isSearch ? `${GOOGLE_SEARCH_URL}${encodeURIComponent(url)}` 
      : !/^(https?:\/\/)/.test(url) ? 'https://' + url
      : url;

    if(props.settings.upgradeHttpToHttps && finalUrl.startsWith('http://')) {
        finalUrl = 'https' + finalUrl.substring(4);
    }
    
    try {
        const urlObj = new URL(finalUrl);
        const isGoogle = isGoogleUrl(urlObj.href);
        const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, url: finalUrl, isLoading: true, favicon, title: '読み込み中...', isGoogle } : t));
    } catch (e) { console.error("Invalid URL:", finalUrl, e); }
  }, [props.settings.upgradeHttpToHttps]);

  const handleOmniboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTabId && omniboxValue) handleNavigate(omniboxValue, activeTabId);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    setTabs(prev => prev.filter(t => t.id !== tabId));
    delete iframeRefs.current[tabId];

    if (activeTabId === tabId) {
      if (tabs.length > 1) {
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTabId(tabs[newActiveIndex].id);
      } else {
        setActiveTabId(null);
      }
    }
  };
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'proxy-nav') {
            const sourceFrame = event.source;
            const targetTabId = Object.keys(iframeRefs.current).find(id => iframeRefs.current[id]?.contentWindow === sourceFrame);

            if (targetTabId) {
                setTabs(prev => prev.map(t =>
                    t.id === targetTabId ? { ...t, url: event.data.url, title: event.data.title || t.title, isLoading: false } : t
                ));
            }
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [tabs]);

  const getIframeSrc = (tab: Tab) => {
    if (tab.url === NEW_TAB_URL || !tab.url) return undefined;
    
    const params = new URLSearchParams();
    params.set('url', tab.url);
    if (props.settings.adBlockListEnabled) params.set('adBlock', 'true');
    if (props.settings.blockImages) params.set('blockImages', 'true');
    if (props.settings.stealthModeEnabled) params.set('stealthMode', 'true');
    if (props.settings.openLinksInNewTab) params.set('openLinksInNewTab', 'true');
    return `/api/proxy?${params.toString()}`;
  }
  
  const handleIframeLoad = (tabId: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, isLoading: false } : t));
  };

  const iframeAction = (action: 'back' | 'forward' | 'reload') => {
    if (!activeTabId) return;
    const iframe = iframeRefs.current[activeTabId];
    if (!iframe || !iframe.contentWindow) return;
    try {
      if (action === 'reload') iframe.contentWindow.location.reload();
      else if (action === 'back') iframe.contentWindow.history.back();
      else if (action === 'forward') iframe.contentWindow.history.forward();
    } catch(e) { console.error(`Iframe ${action} failed:`, e) }
  }
  
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-200 dark:bg-slate-800 font-sans">
      <div className="flex-shrink-0 bg-slate-200 dark:bg-slate-800 flex items-center pr-2">
        <div className="flex-grow flex items-end pt-2 overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 border-b-0 max-w-xs cursor-pointer group relative bg-clip-padding
                ${tab.id === activeTabId ? 'bg-slate-50 dark:bg-slate-900' : 'bg-slate-300/70 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
              style={{
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                transform: `translateY(${tab.id === activeTabId ? '2px' : '0px'})`,
                transition: 'all 0.2s ease-in-out',
                boxShadow: tab.id === activeTabId ? '0 -2px 5px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {tab.favicon ? <img src={tab.favicon} className="w-4 h-4" alt="" /> : <GlobeIcon className="w-4 h-4 text-gray-500" />}
              <span className="text-sm truncate text-gray-800 dark:text-gray-200">{tab.isLoading ? '読み込み中...' : tab.title}</span>
              <button onClick={(e) => handleCloseTab(e, tab.id)} className={`ml-2 p-0.5 rounded-full hover:bg-red-500 hover:text-white ${tab.id === activeTabId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleNewTab} className="p-1 mb-1 rounded-full hover:bg-slate-400/50 dark:hover:bg-slate-600/50"><PlusIcon className="w-5 h-5" /></button>
      </div>

      <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 flex items-center gap-1 p-2 border-y border-slate-300 dark:border-slate-700 shadow-md">
        <button onClick={() => iframeAction('back')} className={`p-2 ${radius.full} hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30`}><ArrowLeftIcon className="w-5 h-5" /></button>
        <button onClick={() => iframeAction('forward')} className={`p-2 ${radius.full} hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30`}><ArrowRightIcon className="w-5 h-5" /></button>
        <button onClick={() => iframeAction('reload')} className={`p-2 ${radius.full} hover:bg-slate-200 dark:hover:bg-slate-700`}><ReloadIcon className="w-5 h-5" /></button>
        <form onSubmit={handleOmniboxSubmit} className={`flex-grow flex items-center bg-slate-200 dark:bg-slate-800 ${radius.full} focus-within:ring-2 ${accent.ring}`}>
          {activeTab?.isGoogle ? <GlobeIcon className="w-4 h-4 text-green-600 dark:text-green-500 mx-3" /> : <LockIcon className="w-4 h-4 text-gray-500 mx-3" />}
          <input
            type="text"
            value={omniboxValue}
            onChange={e => setOmniboxValue(e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="検索またはURLを入力"
            className="w-full h-9 bg-transparent focus:outline-none text-gray-800 dark:text-white"
          />
        </form>
        <button className={`p-2 ${radius.full} hover:bg-slate-200 dark:hover:bg-slate-700`}><MenuIcon className="w-5 h-5" /></button>
      </div>

      <main className="flex-grow relative bg-slate-50 dark:bg-slate-900">
        {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
                <div key={tab.id} className="w-full h-full" style={{ display: isActive ? 'block' : 'none', position: 'absolute' }}>
                    {tab.url === NEW_TAB_URL ? (
                        <div className="w-full h-full overflow-y-auto">
                           <HomeScreen {...props} onNavigate={(url) => handleNavigate(url, tab.id)} />
                        </div>
                    ) : (
                        <iframe
                            ref={el => { iframeRefs.current[tab.id] = el; }}
                            // Only set src if it's the active tab and the src is not already set, to prevent reloads on tab switch
                            src={isActive ? getIframeSrc(tab) : undefined}
                            onLoad={() => handleIframeLoad(tab.id)}
                            className="w-full h-full border-none"
                            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
                            referrerPolicy="no-referrer"
                        />
                    )}
                </div>
            )
        })}
      </main>
    </div>
  );
};

export default BrowserView;