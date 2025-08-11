import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { CargoSettings, SettingsAction } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

/**
 * This part of the code creates the settings context for managing app-wide configuration
 * Handles settings persistence, state management, and real-time updates
 */

interface SettingsContextType {
  settings: CargoSettings;
  updateAgentSetting: (agent: keyof CargoSettings['agents'], setting: string, value: any) => void;
  updateAISetting: (setting: keyof CargoSettings['ai'], value: any) => void;
  updateCacheSetting: (setting: keyof CargoSettings['cache'], value: any) => void;
  updatePageSetting: (page: keyof CargoSettings['pages'], value: boolean) => void;
  updateDisplaySetting: (setting: keyof CargoSettings['display'], value: any) => void;
  updateOperationalSetting: (setting: keyof CargoSettings['operational'], value: any) => void;
  updateUISetting: (setting: keyof CargoSettings['ui'], value: any) => void;
  updateQuickAction: (action: keyof CargoSettings['quickActions'], value: boolean) => void;
  clearCache: () => void;
  resetToDefaults: () => void;
  getCacheStatus: () => { queries: number; storage: string };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * This part of the code handles settings state management with useReducer
 * Manages all setting updates and side effects
 */
function settingsReducer(state: CargoSettings, action: SettingsAction): CargoSettings {
  switch (action.type) {
    case 'UPDATE_AGENT_SETTING':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.agent]: {
            ...state.agents[action.agent],
            [action.setting]: action.value
          }
        }
      };
    
    case 'UPDATE_AI_SETTING':
      return {
        ...state,
        ai: {
          ...state.ai,
          [action.setting]: action.value
        }
      };
    
    case 'UPDATE_CACHE_SETTING':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.setting]: action.value
        }
      };
    
    case 'UPDATE_PAGE_SETTING':
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.page]: action.value
        }
      };
    
    case 'UPDATE_DISPLAY_SETTING':
      return {
        ...state,
        display: {
          ...state.display,
          [action.setting]: action.value
        }
      };
    
    case 'UPDATE_OPERATIONAL_SETTING':
      return {
        ...state,
        operational: {
          ...state.operational,
          [action.setting]: action.value
        }
      };
    
    case 'UPDATE_UI_SETTING':
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.setting]: action.value
        }
      };
    
    case 'UPDATE_QUICK_ACTION':
      return {
        ...state,
        quickActions: {
          ...state.quickActions,
          [action.action]: action.value
        }
      };
    
    case 'CLEAR_CACHE':
      // This part of the code clears the AI cache and resets counters
      if (typeof window !== 'undefined') {
        const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cargo_ai_cache_'));
        cacheKeys.forEach(key => localStorage.removeItem(key));
      }
      return {
        ...state,
        cache: {
          ...state.cache,
          currentQueries: 0,
          storageUsed: '0KB'
        }
      };
    
    case 'RESET_TO_DEFAULTS':
      return { ...DEFAULT_SETTINGS };
    
    case 'LOAD_SETTINGS':
      return action.settings;
    
    default:
      return state;
  }
}

/**
 * This part of the code loads settings from localStorage on initialization
 * Provides fallback to default settings if none exist
 */
function loadSettings(): CargoSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem('cargo_settings');
    if (stored) {
      const parsedSettings = JSON.parse(stored);
      // This part of the code merges stored settings with defaults to handle new settings
      return {
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
        // Ensure nested objects are properly merged
        agents: { ...DEFAULT_SETTINGS.agents, ...parsedSettings.agents },
        ai: { ...DEFAULT_SETTINGS.ai, ...parsedSettings.ai },
        cache: { ...DEFAULT_SETTINGS.cache, ...parsedSettings.cache },
        pages: { ...DEFAULT_SETTINGS.pages, ...parsedSettings.pages },
        display: { ...DEFAULT_SETTINGS.display, ...parsedSettings.display },
        operational: { ...DEFAULT_SETTINGS.operational, ...parsedSettings.operational },
        ui: { ...DEFAULT_SETTINGS.ui, ...parsedSettings.ui },
        quickActions: { ...DEFAULT_SETTINGS.quickActions, ...parsedSettings.quickActions }
      };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * This part of the code calculates current cache status
 * Returns query count and storage usage for cache management
 */
function calculateCacheStatus(): { queries: number; storage: string } {
  if (typeof window === 'undefined') return { queries: 0, storage: '0KB' };
  
  try {
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cargo_ai_cache_'));
    const totalSize = cacheKeys.reduce((size, key) => {
      const item = localStorage.getItem(key);
      return size + (item ? item.length : 0);
    }, 0);
    
    // This part of the code converts bytes to readable format
    const sizeKB = Math.round(totalSize / 1024 * 100) / 100;
    const sizeStr = sizeKB < 1 ? `${totalSize}B` : `${sizeKB}KB`;
    
    return {
      queries: cacheKeys.length,
      storage: sizeStr
    };
  } catch (error) {
    console.warn('Failed to calculate cache status:', error);
    return { queries: 0, storage: '0KB' };
  }
}

/**
 * This part of the code provides the settings context provider
 * Manages settings state and persistence for the entire app
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);

  // This part of the code loads settings on component mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    dispatch({ type: 'LOAD_SETTINGS', settings: loadedSettings });
  }, []);

  // This part of the code saves settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cargo_settings', JSON.stringify(settings));
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error);
      }
    }
  }, [settings]);

  // This part of the code updates cache status periodically
  useEffect(() => {
    const updateCacheStatus = () => {
      const status = calculateCacheStatus();
      dispatch({ 
        type: 'UPDATE_CACHE_SETTING', 
        setting: 'currentQueries', 
        value: status.queries 
      });
      dispatch({ 
        type: 'UPDATE_CACHE_SETTING', 
        setting: 'storageUsed', 
        value: status.storage 
      });
    };

    updateCacheStatus();
    const interval = setInterval(updateCacheStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const contextValue: SettingsContextType = {
    settings,
    updateAgentSetting: (agent, setting, value) => {
      dispatch({ type: 'UPDATE_AGENT_SETTING', agent, setting, value });
    },
    updateAISetting: (setting, value) => {
      dispatch({ type: 'UPDATE_AI_SETTING', setting, value });
    },
    updateCacheSetting: (setting, value) => {
      dispatch({ type: 'UPDATE_CACHE_SETTING', setting, value });
    },
    updatePageSetting: (page, value) => {
      dispatch({ type: 'UPDATE_PAGE_SETTING', page, value });
    },
    updateDisplaySetting: (setting, value) => {
      dispatch({ type: 'UPDATE_DISPLAY_SETTING', setting, value });
    },
    updateOperationalSetting: (setting, value) => {
      dispatch({ type: 'UPDATE_OPERATIONAL_SETTING', setting, value });
    },
    updateUISetting: (setting, value) => {
      dispatch({ type: 'UPDATE_UI_SETTING', setting, value });
    },
    updateQuickAction: (action, value) => {
      dispatch({ type: 'UPDATE_QUICK_ACTION', action, value });
    },
    clearCache: () => {
      dispatch({ type: 'CLEAR_CACHE' });
    },
    resetToDefaults: () => {
      dispatch({ type: 'RESET_TO_DEFAULTS' });
    },
    getCacheStatus: calculateCacheStatus
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * This part of the code provides the hook for using settings context
 * Ensures context is available and provides type safety
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

/**
 * This part of the code provides individual setting hooks for convenience
 * Allows components to subscribe to specific setting changes
 */
export function useAgentSettings() {
  const { settings } = useSettings();
  return settings.agents;
}

export function useAISettings() {
  const { settings } = useSettings();
  return settings.ai;
}

export function useDisplaySettings() {
  const { settings } = useSettings();
  return settings.display;
}
