import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CycleContext = createContext();

const initialState = {
  cycles: [],
  currentCycle: null,
  predictions: {
    nextPeriod: null,
    ovulation: null,
    fertilityWindow: { start: null, end: null }
  },
  symptoms: []
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
    
    default:
      return state;
  }
}

export function CycleProvider({ children }) {
  const [state, dispatch] = useReducer(cycleReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('lunation-data');
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lunation-data', JSON.stringify(state));
  }, [state]);

  return (
    <CycleContext.Provider value={{ state, dispatch }}>
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