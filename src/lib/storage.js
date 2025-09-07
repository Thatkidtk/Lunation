// Robust localStorage wrapper and schema migration
import * as Sentry from '@sentry/react';
import { safeJSONParse } from '../utils/security';
import { z } from 'zod';

const PREFIX = 'lunation:';
const VERSION_KEY = `${PREFIX}version`;
export const STORAGE_VERSION = 1;
export const DATA_KEY = 'lunation-data';

/** @template T @param {string} key @param {T} fallback */
export function get(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_e) { return fallback; }
}

/** @template T @param {string} key @param {T} value */
export function set(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (_e) {}
}

export function remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch (_e) {}
}

function normalizeMedication(x) {
  if (!x || typeof x !== 'object') return null;
  return {
    id: x.id ?? Date.now() + Math.random(),
    name: String(x.name ?? 'Untitled'),
    type: x.type ?? 'other',
    dosage: x.dosage ?? '',
    frequency: x.frequency ?? 'as-needed',
    startDate: x.startDate ?? '',
    notes: x.notes ?? '',
    createdAt: x.createdAt ?? new Date().toISOString(),
    isActive: x.isActive ?? true,
  };
}

function normalizeSymptom(x) {
  if (!x || typeof x !== 'object') return null;
  return {
    id: x.id ?? `${x.date ?? new Date().toISOString().slice(0,10)}-${x.type ?? 'unknown'}`,
    type: x.type ?? 'unknown',
    date: x.date ?? new Date().toISOString().slice(0,10),
    severity: x.severity ?? 'mild',
    notes: x.notes ?? '',
    timestamp: x.timestamp ?? new Date().toISOString(),
  };
}

function normalizeCycle(x) {
  if (!x || typeof x !== 'object') return null;
  return { ...x };
}

export function migrateStorage() {
  try {
    const currentVersion = Number(localStorage.getItem(VERSION_KEY) ?? 0);
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) { localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION)); return; }
    const data = safeJSONParse(raw, null);
    if (!data || typeof data !== 'object') {
      Sentry.captureMessage('lunation.storage.corrupt', { level: 'warning' });
      const reset = { cycles: [], medications: [], symptoms: [], _version: STORAGE_VERSION };
      localStorage.setItem(DATA_KEY, JSON.stringify(reset));
      localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
      return;
    }

    if (currentVersion < 1) {
      const MedSchema = z.object({
        id: z.union([z.string(), z.number()]),
        name: z.string().min(1),
        createdAt: z.string(),
        isActive: z.boolean(),
      }).passthrough();
      const SymSchema = z.object({
        id: z.union([z.string(), z.number()]),
        type: z.string(),
        date: z.string(),
      }).passthrough();
      const meds = (Array.isArray(data.medications) ? data.medications.map(normalizeMedication).filter(Boolean) : [])
        .filter((m) => MedSchema.safeParse(m).success);
      const syms = (Array.isArray(data.symptoms) ? data.symptoms.map(normalizeSymptom).filter(Boolean) : [])
        .filter((s) => SymSchema.safeParse(s).success);
      const cycles = Array.isArray(data.cycles) ? data.cycles.map(normalizeCycle).filter(Boolean) : [];
      const next = { ...data, medications: meds, symptoms: syms, cycles, _version: STORAGE_VERSION };
      localStorage.setItem(DATA_KEY, JSON.stringify(next));
      localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
    }
  } catch (e) {
    Sentry.captureException(e);
  }
}
