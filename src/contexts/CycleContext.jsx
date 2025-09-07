import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { safeJSONParse, safeLocalStorageSet, STORAGE_KEY, SCHEMA_VERSION, encryptJSONWithPassphrase, decryptJSONWithPassphrase } from '../utils/security';
import { calculatePredictions } from '../utils/cycleCalculations';

const CycleContext = createContext();

const initialState = {
  cycles: [],
  currentCycle: null,
  predictions: {
    nextPeriod: null,
    ovulation: null,
    fertilityWindow: { start: null, end: null }
  },
  symptoms: [],
  medications: []
};

function cycleReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    case 'ADD_CYCLE':
      const newCycles = [...state.cycles, action.payload];
      return {
        ...state,
        cycles: newCycles,
        currentCycle: action.payload
      };
    
    case 'UPDATE_PREDICTIONS':
      return {
        ...state,
        predictions: action.payload
      };
    
    case 'ADD_SYMPTOM':
      return {
        ...state,
        symptoms: [...state.symptoms, action.payload]
      };
    
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [...state.medications, action.payload]
      };
    
    case 'TOGGLE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(med => 
          med.id === action.payload.id 
            ? { ...med, isActive: !med.isActive }
            : med
        )
      };
    
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(med => med.id !== action.payload.id)
      };
    
    default:
      return state;
  }
}

export function CycleProvider({ children }) {
  const [state, dispatch] = useReducer(cycleReducer, initialState);
  const [encryption, setEncryption] = useState({ enabled: false, locked: false, passphrase: null });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = safeJSONParse(saved, null);
      if (!parsed || typeof parsed !== 'object') return;

      if (parsed._enc === true) {
        setEncryption({ enabled: true, locked: true, passphrase: null });
        return; // Wait for user to unlock in Settings
      }

      const cycles = Array.isArray(parsed.cycles) ? parsed.cycles : [];
      const medications = Array.isArray(parsed.medications) ? parsed.medications : [];
      const symptoms = Array.isArray(parsed.symptoms) ? parsed.symptoms : [];

      const predictions = calculatePredictions(cycles);

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          cycles,
          medications,
          symptoms,
          predictions,
          currentCycle: parsed.currentCycle || null,
          _version: parsed._version || SCHEMA_VERSION
        }
      });
    } catch (_e) {
      // Ignore malformed storage
    }
  }, []);

  useEffect(() => {
    const persist = async () => {
      const payload = { ...state, _version: SCHEMA_VERSION };
      if (encryption.enabled) {
        if (encryption.locked || !encryption.passphrase) {
          return; // Do not overwrite encrypted data with plaintext
        }
        try {
          const enc = await encryptJSONWithPassphrase(payload, encryption.passphrase);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
        } catch (_e) {
          // Ignore persistence error
        }
      } else {
        if (!safeLocalStorageSet(STORAGE_KEY, payload)) {
          // best-effort
        }
      }
    };
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, encryption.enabled, encryption.locked, encryption.passphrase]);

  // Debounced periodic flush and on visibility change
  useEffect(() => {
    let intervalId;
    const flush = () => {
      const payload = { ...state, _version: SCHEMA_VERSION };
      if (!encryption.enabled) {
        safeLocalStorageSet(STORAGE_KEY, payload);
      }
    };
    // periodic every 15s
    intervalId = window.setInterval(flush, 15000);
    const onVis = () => { if (document.hidden) flush(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [state, encryption.enabled]);

  // Controls for encryption
  const unlock = async (passphrase) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) throw new Error('No saved data');
    const parsed = safeJSONParse(saved, null);
    if (!parsed || parsed._enc !== true) throw new Error('Data is not encrypted');
    const decrypted = await decryptJSONWithPassphrase(parsed, passphrase);

    const cycles = Array.isArray(decrypted.cycles) ? decrypted.cycles : [];
    const medications = Array.isArray(decrypted.medications) ? decrypted.medications : [];
    const symptoms = Array.isArray(decrypted.symptoms) ? decrypted.symptoms : [];
    const predictions = calculatePredictions(cycles);

    dispatch({ type: 'LOAD_DATA', payload: {
      cycles,
      medications,
      symptoms,
      predictions,
      currentCycle: decrypted.currentCycle || null,
      _version: decrypted._version || SCHEMA_VERSION
    }});
    setEncryption({ enabled: true, locked: false, passphrase });
  };

  const enableEncryption = async (passphrase) => {
    const payload = { ...state, _version: SCHEMA_VERSION };
    const enc = await encryptJSONWithPassphrase(payload, passphrase);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
    setEncryption({ enabled: true, locked: false, passphrase });
  };

  const disableEncryption = async (passphrase) => {
    // Verify passphrase before disabling
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = safeJSONParse(saved, null);
      if (parsed && parsed._enc === true) {
        await decryptJSONWithPassphrase(parsed, passphrase); // throws if wrong
      }
    }
    setEncryption({ enabled: false, locked: false, passphrase: null });
    const payload = { ...state, _version: SCHEMA_VERSION };
    safeLocalStorageSet(STORAGE_KEY, payload);
  };

  const changePassphrase = async (oldPass, newPass) => {
    await unlock(oldPass);
    await enableEncryption(newPass);
  };

  return (
    <CycleContext.Provider value={{
      state,
      dispatch,
      encryption,
      unlock,
      enableEncryption,
      disableEncryption,
      changePassphrase
    }}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
}
