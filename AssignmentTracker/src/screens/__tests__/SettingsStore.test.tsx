import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useSettingsStore,
  parseStoredSettings,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from '../../store/SettingsStore';
import { AppSettings } from '../../types';

const setItemMock = AsyncStorage.setItem as jest.Mock;
const getItemMock = AsyncStorage.getItem as jest.Mock;

const resetStore = () => {
  useSettingsStore.setState({
    settings: { ...DEFAULT_SETTINGS },
    isLoaded: false,
    loadError: false,
  });
};

describe('parseStoredSettings', () => {
  it('returns defaults for null, arrays, and primitives', () => {
    expect(parseStoredSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings([])).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings('test')).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings(42)).toEqual(DEFAULT_SETTINGS);
  });

  it('accepts a valid assignment type', () => {
    expect(parseStoredSettings({ defaultAssignmentType: 'task' })).toEqual({
      defaultAssignmentType: 'task',
    });
  });

  it('falls back to the default for an unknown assignment type', () => {
    expect(parseStoredSettings({ defaultAssignmentType: 'essay' })).toEqual(DEFAULT_SETTINGS);
  });

  it('ignores unknown keys instead of spreading them into settings', () => {
    const parsed = parseStoredSettings({ defaultAssignmentType: 'test', theme: 'dark' });
    expect(parsed).toEqual({ defaultAssignmentType: 'test' });
    expect(Object.keys(parsed)).toEqual(['defaultAssignmentType']);
  });
});

describe('SettingsStore', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    resetStore();
    await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
  });

  it('uses defaults when nothing is stored', async () => {
    await useSettingsStore.getState().loadSettings();
    const { settings, isLoaded, loadError } = useSettingsStore.getState();

    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(isLoaded).toBe(true);
    expect(loadError).toBe(false);
  });

  it('loads a valid persisted default assignment type', async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ defaultAssignmentType: 'test' })
    );

    await useSettingsStore.getState().loadSettings();

    expect(useSettingsStore.getState().settings.defaultAssignmentType).toBe('test');
    expect(useSettingsStore.getState().loadError).toBe(false);
  });

  it('falls back to defaults and flags the error for invalid JSON', async () => {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, 'not-json');

    await useSettingsStore.getState().loadSettings();

    const { settings, isLoaded, loadError } = useSettingsStore.getState();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(isLoaded).toBe(true);
    expect(loadError).toBe(true);
  });

  it('falls back to defaults when the read itself fails', async () => {
    getItemMock.mockRejectedValueOnce(new Error('storage unavailable'));

    await useSettingsStore.getState().loadSettings();

    const { settings, isLoaded, loadError } = useSettingsStore.getState();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(isLoaded).toBe(true);
    expect(loadError).toBe(true);
  });

  it('falls back to defaults for a malformed stored value', async () => {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ defaultAssignmentType: 7 }));

    await useSettingsStore.getState().loadSettings();

    expect(useSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS);
  });

  it('only reads storage once across repeated load calls', async () => {
    await useSettingsStore.getState().loadSettings();
    await useSettingsStore.getState().loadSettings();

    expect(getItemMock).toHaveBeenCalledTimes(1);
  });

  it('persists a new default type and updates state', async () => {
    const saved = await useSettingsStore.getState().setDefaultAssignmentType('other');

    expect(saved).toBe(true);
    expect(useSettingsStore.getState().settings.defaultAssignmentType).toBe('other');
    expect(setItemMock).toHaveBeenCalledWith(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ defaultAssignmentType: 'other' })
    );
  });

  it('leaves state unchanged and reports failure when the write fails', async () => {
    await useSettingsStore.getState().loadSettings();
    setItemMock.mockRejectedValueOnce(new Error('disk full'));

    const saved = await useSettingsStore.getState().setDefaultAssignmentType('task');

    expect(saved).toBe(false);
    expect(useSettingsStore.getState().settings.defaultAssignmentType).toBe('homework');
  });

  it('clears a previous load error after a successful save', async () => {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, 'not-json');
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().loadError).toBe(true);

    await useSettingsStore.getState().setDefaultAssignmentType('test');

    expect(useSettingsStore.getState().loadError).toBe(false);
  });

  it('keeps the stored payload limited to known settings fields', async () => {
    await useSettingsStore.getState().loadSettings();
    await useSettingsStore.getState().setDefaultAssignmentType('test');

    const payload = setItemMock.mock.calls[setItemMock.mock.calls.length - 1][1];
    const parsed: AppSettings = JSON.parse(payload);
    expect(parsed).toEqual({ defaultAssignmentType: 'test' });
  });
});
