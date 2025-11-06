import React, { useState, useEffect } from 'react';
import type { Shortcut, HistoryItem, Settings, AccentColor, UiCornerRadius } from '../types';

const PlusIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);
const TrashIcon: React.FC<{className: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const SunIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const MoonIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);
const HistoryIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const SettingsIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const CloseIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface HomeScreenProps {
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
    pills: { main: 'rounded-full', large: 'rounded-3xl', full: 'rounded-full'},
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "おはようございます";
    if (hour < 18) return "こんにちは";
    return "こんばんは";
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, isDarkMode, toggleDarkMode, shortcuts, addShortcut, deleteShortcut, history, clearHistory, settings, updateSettings }) => {
  const [url, setUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');
  const [time, setTime] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [greeting, setGreeting] = useState('');


  useEffect(() => {
    const timerId = setInterval(() => {
        setTime(new Date());
    }, 1000);
    setGreeting(getGreeting());

    return () => {
        clearInterval(timerId);
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = url.trim();
    if (!query) return;

    const isLikelyUrl = (query.includes('.') && !query.includes(' ')) || query.toLowerCase().startsWith('localhost') || query.startsWith('http://') || query.startsWith('https://');

    if (isLikelyUrl) {
      onNavigate(query.startsWith('http') ? query : `https://` + query);
    } else {
      const searchUrlMap: Record<Settings['defaultSearchEngine'], string> = {
          duckduckgo: `https://duckduckgo.com/?q=`,
          bing: `https://www.bing.com/search?q=`,
          google: `https://www.google.com/search?q=`,
      };
      onNavigate(`${searchUrlMap[settings.defaultSearchEngine]}${encodeURIComponent(query)}`);
    }
  };
  
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
    
  const bgClass = isDarkMode ? settings.theme === 'oled' ? 'oled-dark' : 'bg-glass-dark' : 'bg-glass-light';
  const accent = ACCENT_COLOR_MAP[settings.accentColor];
  const radius = CORNER_RADIUS_MAP[settings.uiCornerRadius];


  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen p-4 font-sans overflow-hidden transition-colors duration-500 ${bgClass} animate-move-glass-bg`}>
      <div className="absolute top-5 right-5 flex items-center gap-2">
         <div className="relative">
            <button 
                onClick={() => setShowHistory(p => !p)} 
                aria-label="履歴を表示"
                className={`p-2 ${radius.full} text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-110`}
            >
                <HistoryIcon className="w-6 h-6" />
            </button>
            {showHistory && (
                <div className={`absolute top-full right-0 mt-2 w-80 bg-white/80 dark:bg-black/80 backdrop-blur-xl ${radius.large} shadow-2xl ring-1 ring-black/10 z-50 overflow-hidden animate-scale-in origin-top-right`}>
                    <div className="p-2 flex justify-between items-center border-b border-black/10 dark:border-white/10">
                        <h3 className="font-bold text-gray-800 dark:text-white px-2">履歴</h3>
                        <button onClick={clearHistory} className="text-sm px-2 py-1 rounded hover:bg-red-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors">消去</button>
                    </div>
                    <ul className="max-h-96 overflow-y-auto">
                        {history.length > 0 ? history.map(item => (
                            <li key={item.id}>
                                <button onClick={() => { onNavigate(item.url); setShowHistory(false); }} className={`w-full text-left px-4 py-2 hover:bg-${accent.bg}/20 dark:hover:bg-${accent.bg}/30 transition-colors`}>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.url}</p>
                                </button>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">履歴はありません。</li>
                        )}
                    </ul>
                </div>
            )}
         </div>
        <button 
            onClick={() => setShowSettings(true)} 
            aria-label="設定を開く"
            className={`p-2 ${radius.full} text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-110`}
        >
            <SettingsIcon className="w-6 h-6" />
        </button>
        <button 
            onClick={toggleDarkMode} 
            aria-label="ダークモードを切り替え"
            className={`p-2 ${radius.full} text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-110`}
        >
            <div className={`transition-transform duration-500 ease-in-out ${isDarkMode ? 'rotate-[360deg]' : 'rotate-0'}`}>
            {isDarkMode ? <MoonIcon className="w-6 h-6 text-sky-300" /> : <SunIcon className="w-6 h-6 text-amber-500" />}
            </div>
        </button>
      </div>

      <div className="w-full max-w-2xl text-center">
        { settings.showGreeting && (
            <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>{greeting}</p>
        )}
        <h1 
          className="text-6xl md:text-8xl font-bold text-gray-800 dark:text-white mb-2 animate-fade-in-up font-orbitron"
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}
        >
          Xerox Pro
        </h1>
        { settings.showClockOnHomepage && (
          <p className="text-5xl text-gray-700 dark:text-gray-200 mb-10 animate-fade-in-up font-orbitron" style={{ animationDelay: '0.2s' }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        )}

        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <form onSubmit={handleSubmit} className={`flex items-center bg-white/50 dark:bg-black/30 backdrop-blur-xl ${radius.full} shadow-2xl overflow-hidden focus-within:ring-2 ${accent.ring} transition-all duration-300`}>
                <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="検索またはURLを入力"
                className="w-full px-6 py-4 bg-transparent focus:outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                autoFocus
                />
                <button type="submit" aria-label="移動" className={`p-3 ${accent.bg} ${accent.hover} ${radius.full} text-white transition-colors shrink-0 m-2 shadow-lg hover:shadow-xl transform hover:scale-105`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </form>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {shortcuts.map((shortcut, index) => (
                <div 
                  key={shortcut.id} 
                  className="group relative animate-scale-in"
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                >
                    <button onClick={() => onNavigate(shortcut.url)} className={`flex flex-col items-center p-3 bg-white/30 dark:bg-black/30 backdrop-blur-lg ${radius.main} w-20 h-20 justify-center hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200 transform hover:-translate-y-2 hover:shadow-xl`}>
                        <img src={shortcut.iconUrl} alt={shortcut.name} className="w-10 h-10 mb-1 rounded-md" />
                        <span className={`text-xs truncate w-full px-1 text-gray-800 dark:text-gray-200 font-medium ${settings.shortcutNameVisibility === 'on_hover' ? 'opacity-0 group-hover:opacity-100' : settings.shortcutNameVisibility === 'never' ? 'hidden' : 'opacity-100'}`}>{shortcut.name}</span>
                    </button>
                    <button onClick={() => deleteShortcut(shortcut.id)} aria-label={`ショートカット「${shortcut.name}」を削除`} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out transform hover:scale-110">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            ))}
            <div 
              className="animate-scale-in"
              style={{ animationDelay: `${0.5 + shortcuts.length * 0.05}s` }}
            >
              <button onClick={() => setShowAddForm(true)} className={`flex flex-col items-center p-3 bg-white/30 dark:bg-black/30 backdrop-blur-lg ${radius.main} w-20 h-20 justify-center hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200 transform hover:-translate-y-2 hover:shadow-xl`}>
                  <PlusIcon className="w-10 h-10 text-gray-800 dark:text-gray-200" />
                  <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">追加</span>
              </button>
            </div>
        </div>
        
        {showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-scale-in" onClick={() => setShowAddForm(false)}>
                <form 
                  onSubmit={handleAddShortcut} 
                  className={`bg-gray-200 dark:bg-gray-800 p-6 ${radius.large} shadow-xl w-full max-w-sm animate-spring-in`}
                  onClick={e => e.stopPropagation()}
                >
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">新しいショートカットを追加</h3>
                    <input 
                        type="text" 
                        value={newShortcutName}
                        onChange={e => setNewShortcutName(e.target.value)}
                        placeholder="名前 (例: ウィキペディア)" 
                        className={`w-full p-2 mb-4 ${radius.main} bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${accent.focus}`}
                        required
                    />
                    <input 
                        type="text"
                        value={newShortcutUrl}
                        onChange={e => setNewShortcutUrl(e.target.value)}
                        placeholder="URL (例: wikipedia.org)" 
                        className={`w-full p-2 mb-4 ${radius.main} bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 ${accent.focus}`}
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className={`px-4 py-2 ${radius.main} bg-gray-400 hover:bg-gray-500 text-white transition-colors`}>キャンセル</button>
                        <button type="submit" className={`px-4 py-2 ${radius.main} ${accent.bg} ${accent.hover} text-white transition-colors`}>追加</button>
                    </div>
                </form>
            </div>
        )}

        {showSettings && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-scale-in" onClick={() => setShowSettings(false)}>
                <div className={`bg-gray-100 dark:bg-gray-900 ${radius.large} shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col animate-spring-in`} onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">設定</h2>
                        <button onClick={() => setShowSettings(false)} className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700`}>
                            <CloseIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-8 text-left text-sm text-gray-800 dark:text-gray-200">
                        <fieldset className="space-y-4 animate-fade-in-up">
                            <legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">一般</legend>
                            <div className="flex items-center justify-between">
                                <label htmlFor="search-engine" className="text-sm">デフォルトの検索エンジン</label>
                                <select id="search-engine" value={settings.defaultSearchEngine} onChange={e => updateSettings({ defaultSearchEngine: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}>
                                    <option value="duckduckgo">DuckDuckGo</option>
                                    <option value="bing">Bing</option>
                                    <option value="google">Google</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="upgrade-https" className="text-sm">HTTPをHTTPSに自動アップグレード</label>
                                <input type="checkbox" id="upgrade-https" checked={settings.upgradeHttpToHttps} onChange={e => updateSettings({ upgradeHttpToHttps: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="open-new-tab" className="text-sm">プロキシ先のリンクを新しいタブで開く</label>
                                <input type="checkbox" id="open-new-tab" checked={settings.openLinksInNewTab} onChange={e => updateSettings({ openLinksInNewTab: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} />
                            </div>
                        </fieldset>
                        <fieldset className="space-y-4 animate-fade-in-up">
                            <legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">外観</legend>
                            <div className="flex items-center justify-between"><label htmlFor="theme" className="text-sm">テーマ</label><select id="theme" value={settings.theme} onChange={e => updateSettings({ theme: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="system">システム</option><option value="light">ライト</option><option value="dark">ダーク</option><option value="oled">OLED</option></select></div>
                            <div className="flex items-center justify-between"><label htmlFor="accent-color" className="text-sm">アクセントカラー</label><select id="accent-color" value={settings.accentColor} onChange={e => updateSettings({ accentColor: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="indigo">インディゴ</option><option value="sky">スカイ</option><option value="emerald">エメラルド</option><option value="rose">ローズ</option><option value="amber">アンバー</option><option value="violet">バイオレット</option><option value="cyan">シアン</option><option value="slate">スレート</option></select></div>
                            <div className="flex items-center justify-between"><label htmlFor="ui-radius" className="text-sm">UIの丸み</label><select id="ui-radius" value={settings.uiCornerRadius} onChange={e => updateSettings({ uiCornerRadius: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="sharp">シャープ</option><option value="standard">標準</option><option value="rounded">丸い</option><option value="pills">ピル</option></select></div>
                            <div className="flex items-center justify-between"><label htmlFor="show-greeting" className="text-sm">ホームページに挨拶を表示</label><input type="checkbox" id="show-greeting" checked={settings.showGreeting} onChange={e => updateSettings({ showGreeting: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} /></div>
                            <div className="flex items-center justify-between"><label htmlFor="show-clock" className="text-sm">ホームページに時計を表示</label><input type="checkbox" id="show-clock" checked={settings.showClockOnHomepage} onChange={e => updateSettings({ showClockOnHomepage: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} /></div>
                            <div className="flex items-center justify-between"><label htmlFor="shortcut-names" className="text-sm">ショートカット名の表示</label><select id="shortcut-names" value={settings.shortcutNameVisibility} onChange={e => updateSettings({ shortcutNameVisibility: e.target.value as any })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="always">常に表示</option><option value="on_hover">ホバー時に表示</option><option value="never">常に非表示</option></select></div>
                        </fieldset>
                         <fieldset className="space-y-4 animate-fade-in-up">
                            <legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">プロキシとセキュリティ</legend>
                            <div><div className="flex items-center justify-between"><label htmlFor="stealth-mode" className="text-sm font-medium">ステルスモード (reCAPTCHA対策)</label><input type="checkbox" id="stealth-mode" checked={settings.stealthModeEnabled} onChange={e => updateSettings({ stealthModeEnabled: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} /></div><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">通常のブラウザを装い、ボット検出を回避しようとします。一部サイトで問題が起きる場合はオフにしてください。</p></div>
                            <div className="flex items-center justify-between"><label htmlFor="ad-block" className="text-sm">広告をブロック (試験的)</label><input type="checkbox" id="ad-block" checked={settings.adBlockListEnabled} onChange={e => updateSettings({ adBlockListEnabled: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} /></div>
                            <div className="flex items-center justify-between"><label htmlFor="block-scripts" className="text-sm">スクリプトをブロック</label><input type="checkbox" id="block-scripts" checked={settings.blockScripts} onChange={e => updateSettings({ blockScripts: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} /></div>
                            <div className="flex items-center justify-between"><label htmlFor="block-images" className="text-sm">画像をブロック</label><input type="checkbox" id="block-images" checked={settings.blockImages} onChange={e => updateSettings({ blockImages: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} /></div>
                        </fieldset>
                        <fieldset className="space-y-4 animate-fade-in-up">
                            <legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">履歴とデータ</legend>
                            <div className="flex items-center justify-between"><label htmlFor="history-limit" className="text-sm">履歴の最大件数</label><select id="history-limit" value={settings.historySizeLimit} onChange={e => updateSettings({ historySizeLimit: Number(e.target.value) })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="50">50件</option><option value="100">100件</option><option value="500">500件</option><option value="0">無制限</option></select></div>
                            <div className="flex items-center justify-between"><label htmlFor="auto-clear-history" className="text-sm">履歴の自動消去</label><select id="auto-clear-history" value={settings.autoClearHistoryAfterDays} onChange={e => updateSettings({ autoClearHistoryAfterDays: Number(e.target.value) })} className={`p-2 ${radius.main} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 ${accent.focus}`}><option value="0">しない</option><option value="90">90日後</option><option value="30">30日後</option><option value="7">7日後</option></select></div>
                            <div className="flex items-center justify-between"><label htmlFor="clear-history-exit" className="text-sm">終了時に履歴を消去</label><input type="checkbox" id="clear-history-exit" checked={settings.clearHistoryOnExit} onChange={e => updateSettings({ clearHistoryOnExit: e.target.checked })} className={`w-5 h-5 ${radius.main} ${accent.text} focus:ring-offset-0 ${accent.focus}`} /></div>
                        </fieldset>
                        <fieldset className="animate-fade-in-up">
                            <legend className="text-base font-semibold border-b border-gray-300 dark:border-gray-600 w-full pb-2 mb-2">データ管理</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4">
                                <button className={`px-4 py-2 ${radius.main} bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm`}>設定をエクスポート</button>
                                <button className={`px-4 py-2 ${radius.main} bg-gray-500 hover:bg-gray-600 text-white transition-colors text-sm`}>設定をインポート</button>
                                <button onClick={() => confirm('すべての設定をリセットしてもよろしいですか？') && updateSettings({} as any)} className={`px-4 py-2 ${radius.main} bg-red-600 hover:bg-red-700 text-white transition-colors text-sm`}>すべての設定をリセット</button>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;