import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import ProxyView from './components/ProxyView';
import BrowserView from './components/BrowserView';
import { useDarkMode } from './hooks/useDarkMode';
import useLocalStorage from './hooks/useLocalStorage';
import type { Shortcut, HistoryItem, Settings } from './types';

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 'yt', name: 'YouTube', url: 'https://youtube.com', iconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
  { id: 'sp', name: 'Spotify', url: 'https://open.spotify.com', iconUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64' },
  { id: 'dc', name: 'Discord', url: 'https://discord.com/app', iconUrl: 'https://www.google.com/s2/favicons?domain=discord.com&sz=64' },
  { id: 'tw', name: 'Twitter', url: 'https://twitter.com', iconUrl: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=64' },
  { id: 'gh', name: 'GitHub', url: 'https://github.com', iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64' },
  { id: 'rd', name: 'Reddit', url: 'https://reddit.com', iconUrl: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64' },
];

const DEFAULT_SETTINGS: Settings = {
  // General
  defaultSearchEngine: 'google',
  homepageView: 'shortcuts',
  clearHistoryOnExit: false,
  openLinksInNewTab: false,
  upgradeHttpToHttps: true,
  
  // Appearance
  theme: 'system',
  animationsEnabled: true,
  showClockOnHomepage: true,
  fontFamily: 'system',
  uiDensity: 'comfortable',
  showFavicons: true,
  showGreeting: true,
  accentColor: 'indigo',
  uiCornerRadius: 'rounded',

  // Proxy & Security
  blockScripts: false,
  blockImages: false,
  adBlockListEnabled: true,
  stealthModeEnabled: true, // For reCAPTCHA
  trackerBlockListEnabled: true,
  sendDNTHeader: true,
  userAgent: 'default',
  customUserAgentString: '',

  // History & Data
  historySizeLimit: 0, // 0 for infinite
  showHistoryTimestamps: true,
  groupHistoryByDate: true,
  autoClearHistoryAfterDays: 0, // 0 for never

  // Shortcuts
  shortcutGridColumns: 8,
  sortShortcutsBy: 'date_added',
  showAddShortcutButton: true,
  shortcutNameVisibility: 'always',
  shortcutStyle: 'icon_and_text',

  // Advanced
  enableProxyScriptInjection: true,
  proxyCachePolicy: 'standard',
  
  // Placeholders for future settings/buttons
  _exportSettings: null,
  _importSettings: null,
  _resetAllSettings: null,
};


const App: React.FC = () => {
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [settings, setSettings] = useLocalStorage<Settings>('proxy-settings', DEFAULT_SETTINGS);

  const [isDarkMode] = useDarkMode(settings.theme);
  
  const [shortcuts, setShortcuts] = useLocalStorage<Shortcut[]>('proxy-shortcuts', DEFAULT_SHORTCUTS);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('proxy-history', []);

  const [isPwaMode, setIsPwaMode] = useState(false);

  useEffect(() => {
    // Check for PWA mode once on component mount
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // You can also check for other PWA display modes if needed
    // const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
    setIsPwaMode(isStandalone);
  }, []);

  useEffect(() => {
    const body = window.document.body;
    body.classList.remove('oled-dark');
    if (isDarkMode && settings.theme === 'oled') {
      body.classList.add('oled-dark');
    }
  }, [isDarkMode, settings.theme]);

  const handleHashChange = useCallback(() => {
    if (isPwaMode) return; // Hash routing is disabled in PWA mode
    const hash = window.location.hash;
    if (hash.startsWith('#/proxy/')) {
      try {
        const decodedUrl = decodeURIComponent(hash.substring(8));
        setProxyUrl(decodedUrl);
      } catch (e) {
        console.error("Failed to decode URL from hash:", e);
        window.location.hash = '';
        setProxyUrl(null);
      }
    } else {
      setProxyUrl(null);
    }
  }, [isPwaMode]);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]);
  
  useEffect(() => {
    if (settings.autoClearHistoryAfterDays > 0) {
      const cutoff = Date.now() - settings.autoClearHistoryAfterDays * 24 * 60 * 60 * 1000;
      setHistory(prev => prev.filter(item => item.timestamp >= cutoff));
    }
  }, [settings.autoClearHistoryAfterDays, setHistory]);


  const addToHistory = (url: string) => {
    try {
        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            url: url,
            title: new URL(url).hostname.replace('www.', ''),
            timestamp: Date.now()
        };
        setHistory(prevHistory => {
            if (prevHistory.length > 0 && prevHistory[0].url === url) {
                return prevHistory;
            }
            const updatedHistory = [newHistoryItem, ...prevHistory];
            if (settings.historySizeLimit > 0 && updatedHistory.length > settings.historySizeLimit) {
                return updatedHistory.slice(0, settings.historySizeLimit);
            }
            return updatedHistory;
        });
    } catch (e) {
        console.error("Could not add to history, invalid URL?", url, e);
    }
  };
  
  const clearHistory = () => setHistory([]);

  const addShortcut = (shortcut: Omit<Shortcut, 'id' | 'iconUrl'>) => {
    try {
      const domain = new URL(shortcut.url).hostname;
      const newShortcut: Shortcut = {
        ...shortcut,
        id: Date.now().toString(),
        iconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
      setShortcuts(prev => [...prev, newShortcut]);
    } catch (e) {
      console.error("Could not add shortcut, invalid URL?", shortcut.url);
    }
  };

  const deleteShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(sc => sc.id !== id));
  };
  
  const updateSettings = (newSettings: Partial<Settings>) => {
    if (Object.keys(newSettings).length === 0) { // Reset case
      const confirmed = window.confirm('すべての設定をデフォルトに戻します。よろしいですか？');
      if(confirmed) {
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(prev => ({...prev, ...newSettings}));
    }
  }

  const navigateToUrl = (url: string) => {
    let finalUrl = url;
    if(settings.upgradeHttpToHttps && finalUrl.startsWith('http://')){
      finalUrl = 'https' + finalUrl.substring(4);
    }
    addToHistory(finalUrl);
    window.location.hash = `#/proxy/${encodeURIComponent(finalUrl)}`;
  };

  const handleProxiedUrlChange = (newUrl: string) => {
    const newHash = `#/proxy/${encodeURIComponent(newUrl)}`;
    if (window.location.hash !== newHash) {
      addToHistory(newUrl);
      window.history.pushState(null, '', newHash);
      setProxyUrl(newUrl);
    }
  };

  const goHome = () => {
    window.location.hash = '';
  };
  
  const handleToggleDarkMode = () => {
    updateSettings({ theme: isDarkMode ? 'light' : 'dark' });
  };
  
  const sharedProps = {
    isDarkMode,
    toggleDarkMode: handleToggleDarkMode,
    shortcuts,
    addShortcut,
    deleteShortcut,
    history,
    clearHistory,
    settings,
    updateSettings,
    onNavigate: navigateToUrl,
  };

  return (
    <main>
      {isPwaMode ? (
        <BrowserView {...sharedProps} />
      ) : proxyUrl ? (
        <ProxyView 
            {...sharedProps}
            proxyUrl={proxyUrl} 
            onGoHome={goHome}
            onProxiedUrlChange={handleProxiedUrlChange}
        />
      ) : (
        <HomeScreen {...sharedProps} />
      )}
    </main>
  );
};

export default App;