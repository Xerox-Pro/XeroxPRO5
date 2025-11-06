export interface Shortcut {
  id: string;
  name: string;
  url: string;
  iconUrl: string;
}

export interface HistoryItem {
  id: string;
  url:string;
  title: string;
  timestamp: number;
}

// Fix: Add missing ChatMessage type for AiAssistant component.
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type SearchEngine = 'duckduckgo' | 'bing' | 'google';
export type Theme = 'system' | 'light' | 'dark' | 'oled';
export type UiDensity = 'compact' | 'comfortable' | 'spacious';
export type CachePolicy = 'aggressive' | 'standard' | 'no_cache';
export type AccentColor = 'indigo' | 'sky' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'slate';
export type UiCornerRadius = 'sharp' | 'standard' | 'rounded' | 'pills';
export type ShortcutNameVisibility = 'always' | 'on_hover' | 'never';


export interface Settings {
  // General
  defaultSearchEngine: SearchEngine;
  homepageView: 'shortcuts' | 'search_only';
  clearHistoryOnExit: boolean;
  openLinksInNewTab: boolean;
  upgradeHttpToHttps: boolean;
  
  // Appearance
  theme: Theme;
  animationsEnabled: boolean;
  showClockOnHomepage: boolean;
  fontFamily: string;
  uiDensity: UiDensity;
  showFavicons: boolean;
  showGreeting: boolean;
  accentColor: AccentColor;
  uiCornerRadius: UiCornerRadius;
  
  // Proxy & Security
  blockScripts: boolean;
  blockImages: boolean;
  adBlockListEnabled: boolean;
  stealthModeEnabled: boolean; // For reCAPTCHA
  trackerBlockListEnabled: boolean;
  sendDNTHeader: boolean;
  userAgent: 'default' | 'chrome' | 'firefox' | 'safari' | 'custom';
  customUserAgentString: string;

  // History & Data
  historySizeLimit: number; // 0 for infinite
  showHistoryTimestamps: boolean;
  groupHistoryByDate: boolean;
  autoClearHistoryAfterDays: number; // 0 for never

  // Shortcuts
  shortcutGridColumns: number;
  sortShortcutsBy: 'date_added' | 'name_asc' | 'name_desc';
  showAddShortcutButton: boolean;
  shortcutNameVisibility: ShortcutNameVisibility;
  shortcutStyle: 'icon_only' | 'icon_and_text';
  
  // Advanced
  enableProxyScriptInjection: boolean;
  proxyCachePolicy: CachePolicy;
  
  // Placeholders for future settings/buttons
  _exportSettings: null;
  _importSettings: null;
  _resetAllSettings: null;
}