
import React from 'react';

if (import.meta.env.MODE === 'development') {
  // Store originals
  const originalUseState = React.useState;
  const originalUseEffect = React.useEffect;
  const originalUseReducer = React.useReducer;
  const originalUseContext = React.useContext;
  const originalUseRef = React.useRef;
  const originalUseMemo = React.useMemo;
  const originalUseCallback = React.useCallback;

  React.useState = function(...args) {
    console.log('useState called with:', args);
    return originalUseState.apply(this, args);
  };

  React.useEffect = function(...args) {
    console.log('useEffect called with:', args);
    return originalUseEffect.apply(this, args);
  };

  React.useReducer = function(...args) {
    console.log('useReducer called with:', args);
    return originalUseReducer.apply(this, args);
  };

  React.useContext = function(...args) {
    console.log('useContext called with:', args);
    return originalUseContext.apply(this, args);
  };

  React.useRef = function(...args) {
    console.log('useRef called with:', args);
    return originalUseRef.apply(this, args);
  };

  React.useMemo = function(...args) {
    console.log('useMemo called with:', args);
    return originalUseMemo.apply(this, args);
  };

  React.useCallback = function(...args) {
    console.log('useCallback called with:', args);
    return originalUseCallback.apply(this, args);
  };

  // Override console.error to catch hook violations
  const originalError = console.error;
  console.error = function(...args) {
    if (typeof args[0] === 'string' && (
        args[0].includes('Rendered fewer hooks than expected') ||
        args[0].includes('Rendered more hooks than expected')
      )) {
      console.warn('[HOOK RULE VIOLATION]:', ...args);
    }
    originalError.apply(console, args);
  };
}
