import { AssignmentType } from '../types';
import { colors } from './colors';

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getDayName = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

export const getTypeColor = (type: AssignmentType): string => {
  switch (type) {
    case 'homework':
      return colors.homework;
    case 'test':
      return colors.test;
    case 'task':
      return colors.task;
    default:
      return colors.other;
  }
};

export const getTypeLabel = (type: AssignmentType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`;
  return h === 1 ? `1 hr ${m} min` : `${h} hrs ${m} min`;
};
