import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Shortcut, HistoryItem, Settings, AccentColor, UiCornerRadius } from '../types';

interface ProxyViewProps {
  proxyUrl: string;
  onGoHome: () => void;
  onNavigate: (url: string) => void;
  onProxiedUrlChange: (newUrl: string) => void;
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

const ACCENT_COLOR_MAP: Record<AccentColor, { focus: string; bg: string; text: string; hover: string; ring: string }> = {
    indigo: { focus: 'focus:ring-indigo-500', bg: 'bg-indigo-600', text: 'text-indigo-600', hover: 'hover:bg-indigo-700', ring: 'ring-indigo-500' },
    sky: { focus: 'focus:ring-sky-500', bg: 'bg-sky-600', text: 'text-sky-600', hover: 'hover:bg-sky-700', ring: 'ring-sky-500' },
    emerald: { focus: 'focus:ring-emerald-500', bg: 'bg-emerald-600', text: 'text-emerald-600', hover: 'hover:bg-emerald-700', ring: 'ring-emerald-500' },
    rose: { focus: 'focus:ring-rose-500', bg: 'bg-rose-600', text: 'text-rose-600', hover: 'hover:bg-rose-700', ring: 'ring-rose-500' },
    amber: { focus: 'focus:ring-amber-500', bg: 'bg-amber-600', text: 'text-amber-600', hover: 'hover:bg-amber-700', ring: 'ring-amber-500' },
    violet: { focus: 'focus:ring-violet-500', bg: 'bg-violet-600', text: 'text-violet-600', hover: 'hover:bg-violet-700', ring: 'ring-violet-500' },
    cyan: { focus: 'focus:ring-cyan-500', bg: 'bg-cyan-600', text: 'text-cyan-600', hover: 'hover:bg-cyan-700', ring: 'ring-cyan-500' },
    slate: { focus: 'focus:ring-slate-500', bg: 'bg-slate-600', text: 'text-slate-600', hover: 'hover:bg-slate-700', ring: 'ring-slate-500' },
};

const CORNER_RADIUS_MAP: Record<UiCornerRadius, { main: string; large: string, full: string }> = {
    sharp: { main: 'rounded-none', large: 'rounded-sm', full: 'rounded-none' },
    standard: { main: 'rounded-md', large: 'rounded-lg', full: 'rounded-full' },
    rounded: { main: 'rounded-xl', large: 'rounded-2xl', full: 'rounded-full' },
    pills: { main: 'rounded-full', large: 'rounded-3xl', full: 'rounded-full' },
};


const loadingMessages = [
    "安全な接続を確立しています...",
    "ピクセルを生成中...",
    "コンテンツを描画中...",
    "もうすぐです...",
];

const LoadingSpinner: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-white/30 dark:bg-black/30 backdrop-blur-md z-10">
            <div className="flex space-x-2">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">{loadingMessages[messageIndex]}</p>
        </div>
    );
};

// --- Icons ---
const HomeIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
const LockIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const CloseIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const HistoryIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const SettingsIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const BookmarkIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>);
const SunIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const PlusIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const TrashIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

const AnimatedMenuIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <div className="relative w-6 h-6 flex items-center justify-center">
        <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
        <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
    </div>
);


const ProxyView: React.FC<ProxyViewProps> = ({ 
    proxyUrl, onGoHome, onNavigate, onProxiedUrlChange, 
    isDarkMode, toggleDarkMode,
    shortcuts, addShortcut, deleteShortcut,
    history, clearHistory,
    settings, updateSettings 
}) => {
  const [addressBarUrl, setAddressBarUrl] = useState(proxyUrl);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');

  useEffect(() => {
    setAddressBarUrl(proxyUrl);
    setIsLoading(true);
    // When navigating to a new page, close any open menus.
    setIsNavOpen(false);
    setShowHistory(false);
    setShowShortcuts(false);
    setShowSettings(false);
  }, [proxyUrl]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNavigate(addressBarUrl);
  };
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'proxy-nav') {
            setAddressBarUrl(event.data.url);
            onProxiedUrlChange(event.data.url);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => {
        window.removeEventListener('message', handleMessage);
    };
  }, [onProxiedUrlChange]);

  const handleAddShortcut = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(newShortcutName && newShortcutUrl){
          const newUrl = newShortcutUrl.startsWith('http') ? newShortcutUrl : `https://` + newShortcutUrl;
          addShortcut({
            name: newShortcutName,
            url: newUrl,
          });
          setNewShortcutName('');
          setNewShortcutUrl('');
          setShowAddForm(false);
      }
  }

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    params.set('url', proxyUrl);
    if (settings.adBlockListEnabled) params.set('adBlock', 'true');
    if (settings.blockImages) params.set('blockImages', 'true');
    if (settings.stealthModeEnabled) params.set('stealthMode', 'true');
    if (settings.openLinksInNewTab) params.set('openLinksInNewTab', 'true');
    return `/api/proxy?${params.toString()}`;
  }, [proxyUrl, settings]);

  const accent = ACCENT_COLOR_MAP[settings.accentColor];
  const radius = CORNER_RADIUS_MAP[settings.uiCornerRadius];

  return (
    <div className="h-screen bg-gray-200 dark:bg-gray-900 overflow-hidden">
        <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-label={isNavOpen ? "ナビゲーションを閉じる" : "ナビゲーションを開く"}
            className={`fixed top-4 left-4 z-50 p-3 ${radius.full} bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-lg hover:bg-white/70 dark:hover:bg-black/70 transition-all duration-300 transform hover:scale-110`}
        >
            <AnimatedMenuIcon isOpen={isNavOpen} />
        </button>
        
        {/* Floating UI Container */}
        <div className={`fixed top-0 left-0 right-0 z-40 p-4 space-y-3 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
            {/* URL Bar */}
            <form onSubmit={handleFormSubmit} className={`pointer-events-auto flex items-center bg-white/80 dark:bg-black/50 backdrop-blur-lg ${radius.full} shadow-2xl focus-within:ring-2 ${accent.ring} transition-all max-w-xl mx-auto duration-500 delay-100 ${isNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <LockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mx-4"/>
                <input type="text" value={addressBarUrl} onChange={(e) => setAddressBarUrl(e.target.value)} className="w-full h-12 bg-transparent focus:outline-none text-gray-800 dark:text-white"/>
            </form>

            {/* Action Buttons */}
            <div className={`pointer-events-auto flex items-center justify-center gap-2 bg-white/80 dark:bg-black/50 backdrop-blur-lg ${radius.full} shadow-2xl p-2 max-w-sm mx-auto transition-all duration-500 delay-200 ${isNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <button onClick={onGoHome} title="ホーム" className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300`}><HomeIcon className="w-6 h-6"/></button>
                <button onClick={() => setShowShortcuts(p => !p)} title="ショートカット" className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300`}><BookmarkIcon className="w-6 h-6"/></button>
                
                <div className="relative">
                    <button onClick={() => setShowHistory(p => !p)} title="履歴" className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300`}><HistoryIcon className="w-6 h-6"/></button>
                    {showHistory && (
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white/80 dark:bg-black/80 backdrop-blur-xl ${radius.large} shadow-2xl ring-1 ring-black/10 z-50 overflow-hidden animate-scale-in origin-top`}>
                            <div className="p-2 flex justify-between items-center border-b border-black/10 dark:border-white/10"><h3 className="font-bold text-gray-800 dark:text-white px-2">履歴</h3><button onClick={clearHistory} className="text-sm px-2 py-1 rounded hover:bg-red-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors">消去</button></div>
                            <ul className="max-h-96 overflow-y-auto">{history.length > 0 ? history.map(item => (<li key={item.id}><button onClick={() => { onNavigate(item.url); setShowHistory(false); }} className={`w-full text-left px-4 py-2 hover:bg-${accent.bg}/20 dark:hover:bg-${accent.bg}/30 transition-colors`}><p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.title}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.url}</p></button></li>)) : (<li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">履歴はありません。</li>)}</ul>
                        </div>
                    )}
                </div>

                <button onClick={() => setShowSettings(true)} title="設定" className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300`}><SettingsIcon className="w-6 h-6"/></button>
                <button onClick={toggleDarkMode} title="テーマ切替" className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300`}>{isDarkMode ? <MoonIcon className="w-6 h-6 text-sky-300"/> : <SunIcon className="w-6 h-6 text-amber-500"/>}</button>
            </div>
        </div>

        {/* Modals */}
        {showShortcuts && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
                <div className={`bg-gray-100 dark:bg-gray-900 ${radius.large} shadow-2xl w-full max-w-2xl flex flex-col`} onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800 dark:text-white">ショートカット</h2><button onClick={() => setShowShortcuts(false)} className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700`}><CloseIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" /></button></div>
                    <div className="p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {shortcuts.map(s => (<div key={s.id} className="group relative"><button onClick={() => { onNavigate(s.url); setShowShortcuts(false); }} className={`flex flex-col items-center p-3 bg-white/30 dark:bg-black/30 backdrop-blur-lg ${radius.main} w-20 h-20 justify-center hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200 transform hover:-translate-y-2 hover:shadow-xl`}><img src={s.iconUrl} alt={s.name} className="w-10 h-10 mb-1 rounded-md" /><span className={`text-xs truncate w-full px-1 text-gray-800 dark:text-gray-200 font-medium ${settings.shortcutNameVisibility === 'on_hover' ? 'opacity-0 group-hover:opacity-100' : settings.shortcutNameVisibility === 'never' ? 'hidden' : 'opacity-100'}`}>{s.name}</span></button><button onClick={() => deleteShortcut(s.id)} aria-label={`ショートカット「${s.name}」を削除`} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out transform hover:scale-110"><TrashIcon className="w-4 h-4"/></button></div>))}
                         <button onClick={() => { setShowShortcuts(false); setShowAddForm(true); }} className={`flex flex-col items-center p-3 bg-white/30 dark:bg-black/30 backdrop-blur-lg ${radius.main} w-20 h-20 justify-center hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200 transform hover:-translate-y-2 hover:shadow-xl`}><PlusIcon className="w-10 h-10 text-gray-800 dark:text-gray-200" /><span className="text-xs text-gray-800 dark:text-gray-200 font-medium">追加</span></button>
                    </div>
                </div>
            </div>
        )}

        {showAddForm && (
            <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50`} onClick={() => setShowAddForm(false)}>
                <form onSubmit={handleAddShortcut} className={`bg-gray-200 dark:bg-gray-800 p-6 ${radius.large} shadow-xl w-full max-w-sm`} onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">新しいショートカットを追加</h3><input type="text" value={newShortcutName} onChange={e => setNewShortcutName(e.target.value)} placeholder="名前 (例: ウィキペディア)" className={`w-full p-2 mb-4 ${radius.main} bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${accent.focus}`} required /><input type="text" value={newShortcutUrl} onChange={e => setNewShortcutUrl(e.target.value)} placeholder="URL (例: wikipedia.org)" className={`w-full p-2 mb-4 ${radius.main} bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${accent.focus}`} required /><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowAddForm(false)} className={`px-4 py-2 ${radius.main} bg-gray-400 hover:bg-gray-500 text-white transition-colors`}>キャンセル</button><button type="submit" className={`px-4 py-2 ${radius.main} ${accent.bg} ${accent.hover} text-white transition-colors`}>追加</button></div></form>
            </div>
        )}

        {showSettings && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
                <div className={`bg-gray-100 dark:bg-gray-900 ${radius.large} shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center shrink-0"><h2 className="text-xl font-bold text-gray-800 dark:text-white">設定</h2><button onClick={() => setShowSettings(false)} className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700`}><CloseIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" /></button></div>
                     <div className="p-6 overflow-y-auto space-y-8 text-left text-sm text-gray-800 dark:text-gray-200"><fieldset className="space-y-4"><legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">一般</legend><div className="flex items-center justify-between"><label htmlFor="search-engine" className="text-sm">デフォルトの検索エンジン</label><select id="search-engine" value={settings.defaultSearchEngine} onChange={e => updateSettings({ defaultSearchEngine: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="duckduckgo">DuckDuckGo</option><option value="bing">Bing</option></select></div><div className="flex items-center justify-between"><label htmlFor="upgrade-https" className="text-sm">HTTPをHTTPSに自動アップグレード</label><input type="checkbox" id="upgrade-https" checked={settings.upgradeHttpToHttps} onChange={e => updateSettings({ upgradeHttpToHttps: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div><div className="flex items-center justify-between"><label htmlFor="open-new-tab" className="text-sm">プロキシ先のリンクを新しいタブで開く</label><input type="checkbox" id="open-new-tab" checked={settings.openLinksInNewTab} onChange={e => updateSettings({ openLinksInNewTab: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div></fieldset>
                        <fieldset className="space-y-4"><legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">外観</legend><div className="flex items-center justify-between"><label htmlFor="accent-color" className="text-sm">アクセントカラー</label><select id="accent-color" value={settings.accentColor} onChange={e => updateSettings({ accentColor: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="indigo">インディゴ</option><option value="sky">スカイ</option><option value="emerald">エメラルド</option><option value="rose">ローズ</option></select></div><div className="flex items-center justify-between"><label htmlFor="ui-radius" className="text-sm">UIの丸み</label><select id="ui-radius" value={settings.uiCornerRadius} onChange={e => updateSettings({ uiCornerRadius: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="sharp">シャープ</option><option value="standard">標準</option><option value="rounded">丸い</option></select></div><div className="flex items-center justify-between"><label htmlFor="show-greeting" className="text-sm">ホームページに挨拶を表示</label><input type="checkbox" id="show-greeting" checked={settings.showGreeting} onChange={e => updateSettings({ showGreeting: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div><div className="flex items-center justify-between"><label htmlFor="show-clock" className="text-sm">ホームページに時計を表示</label><input type="checkbox" id="show-clock" checked={settings.showClockOnHomepage} onChange={e => updateSettings({ showClockOnHomepage: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div><div className="flex items-center justify-between"><label htmlFor="shortcut-names" className="text-sm">ショートカット名の表示</label><select id="shortcut-names" value={settings.shortcutNameVisibility} onChange={e => updateSettings({ shortcutNameVisibility: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="always">常に表示</option><option value="on_hover">ホバー時に表示</option><option value="never">常に非表示</option></select></div></fieldset>
                        <fieldset className="space-y-4"><legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">プロキシとセキュリティ</legend><div><div className="flex items-center justify-between"><label htmlFor="stealth-mode" className="text-sm font-medium">ステルスモード (reCAPTCHA対策)</label><input type="checkbox" id="stealth-mode" checked={settings.stealthModeEnabled} onChange={e => updateSettings({ stealthModeEnabled: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">通常のブラウザを装い、ボット検出を回避しようとします。一部サイトで問題が起きる場合はオフにしてください。</p></div><div className="flex items-center justify-between"><label htmlFor="ad-block" className="text-sm">広告をブロック (試験的)</label><input type="checkbox" id="ad-block" checked={settings.adBlockListEnabled} onChange={e => updateSettings({ adBlockListEnabled: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div><div className="flex items-center justify-between"><label htmlFor="block-scripts" className="text-sm">スクリプトをブロック</label><input type="checkbox" id="block-scripts" checked={settings.blockScripts} onChange={e => updateSettings({ blockScripts: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div><div className="flex items-center justify-between"><label htmlFor="block-images" className="text-sm">画像をブロック</label><input type="checkbox" id="block-images" checked={settings.blockImages} onChange={e => updateSettings({ blockImages: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div></fieldset>
                        <fieldset className="space-y-4"><legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">履歴とデータ</legend><div className="flex items-center justify-between"><label htmlFor="history-limit" className="text-sm">履歴の最大件数</label><select id="history-limit" value={settings.historySizeLimit} onChange={e => updateSettings({ historySizeLimit: Number(e.target.value) })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="50">50件</option><option value="100">100件</option><option value="500">500件</option><option value="0">無制限</option></select></div><div className="flex items-center justify-between"><label htmlFor="auto-clear-history" className="text-sm">履歴の自動消去</label><select id="auto-clear-history" value={settings.autoClearHistoryAfterDays} onChange={e => updateSettings({ autoClearHistoryAfterDays: Number(e.target.value) })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="0">しない</option><option value="90">90日後</option><option value="30">30日後</option><option value="7">7日後</option></select></div><div className="flex items-center justify-between"><label htmlFor="clear-history-exit" className="text-sm">終了時に履歴を消去</label><input type="checkbox" id="clear-history-exit" checked={settings.clearHistoryOnExit} onChange={e => updateSettings({ clearHistoryOnExit: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} ${accent.focus}`} /></div></fieldset>
                        <fieldset><legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">データ管理</legend><div className="grid grid-cols-3 gap-2 pt-2"><button className={`px-4 py-2 ${radius.main} bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm`}>設定をエクスポート</button><button className={`px-4 py-2 ${radius.main} bg-gray-500 hover:bg-gray-600 text-white transition-colors text-sm`}>設定をインポート</button><button onClick={() => confirm('すべての設定をリセットしてもよろしいですか？') && updateSettings({} as any)} className={`px-4 py-2 ${radius.main} bg-red-600 hover:bg-red-700 text-white transition-colors text-sm`}>すべての設定をリセット</button></div></fieldset>
                    </div>
                </div>
            </div>
        )}

      <div className={`w-full h-full relative transition-all duration-500 ease-in-out ${isNavOpen ? 'scale-[.95] blur-sm brightness-75 rounded-3xl overflow-hidden' : 'scale-100 blur-0 brightness-100'}`}>
        {isLoading && <LoadingSpinner />}
        <iframe
            ref={iframeRef}
            key={iframeSrc}
            src={iframeSrc}
            className={`w-full h-full border-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            referrerPolicy="no-referrer"
        ></iframe>
      </div>
    </div>
  );
};

export default ProxyView;