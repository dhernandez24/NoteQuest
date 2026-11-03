import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, AssignmentType, ASSIGNMENT_TYPES } from '../types';

export const SETTINGS_STORAGE_KEY = '@settings';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultAssignmentType: 'homework',
};

interface SettingsStore {
  settings: AppSettings;
  isLoaded: boolean;
  loadError: boolean;
  loadSettings: () => Promise<void>;
  setDefaultAssignmentType: (type: AssignmentType) => Promise<boolean>;
  clearLoadError: () => void;
}

const cloneDefaults = (): AppSettings => ({ ...DEFAULT_SETTINGS });

const isValidType = (value: unknown): value is AssignmentType =>
  typeof value === 'string' && (ASSIGNMENT_TYPES as readonly string[]).includes(value);

// Convert raw storage data to valid settings; anything malformed falls back to defaults.
export const parseStoredSettings = (raw: unknown): AppSettings => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return cloneDefaults();
  }

  const candidate = (raw as { defaultAssignmentType?: unknown }).defaultAssignmentType;
  if (isValidType(candidate)) {
    return { defaultAssignmentType: candidate };
  }

  return cloneDefaults();
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: cloneDefaults(),
  isLoaded: false,
  loadError: false,

  // Idempotent: Settings and AddAssignment can both request a load without extra reads.
  loadSettings: async () => {
    if (get().isLoaded) {
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        set({ settings: cloneDefaults(), isLoaded: true, loadError: false });
        return;
      }

      const parsed: unknown = JSON.parse(stored);
      set({ settings: parseStoredSettings(parsed), isLoaded: true, loadError: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ settings: cloneDefaults(), isLoaded: true, loadError: true });
    }
  },

  // Write before updating state so the highlighted option always matches storage.
  setDefaultAssignmentType: async (type: AssignmentType) => {
    if (!isValidType(type)) {
      return false;
    }

    const next: AppSettings = { ...get().settings, defaultAssignmentType: type };

    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      set({ settings: next, loadError: false });
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  },

  clearLoadError: () => set({ loadError: false }),
}));
