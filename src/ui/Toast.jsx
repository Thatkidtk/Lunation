import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * @typedef {Object} ToastItem
 * @property {string} id
 * @property {('success'|'error'|'info')} type
 * @property {string} msg
 * @property {number=} duration
 * @property {{label: string, onClick: () => void}=} action
 */

/** @type {(t: ToastItem) => void} */
let pushFn;

export function ToastHost() {
  const [items, setItems] = useState(/** @type {ToastItem[]} */([]));
  const [target, setTarget] = useState(null);

  useEffect(() => {
    pushFn = (t) => setItems((xs) => [...xs, t]);
    return () => { pushFn = undefined; };
  }, []);

  // Ensure we only portal once document.body exists (production builds load script in <head>)
  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      setTarget(document.body);
    } else {
      const onReady = () => setTarget(document.body);
      window.addEventListener('DOMContentLoaded', onReady, { once: true });
      return () => window.removeEventListener('DOMContentLoaded', onReady);
    }
  }, []);

  const remove = (id) => setItems((xs) => xs.filter((x) => x.id !== id));

  if (!target) return null;

  return createPortal(
    <div className="toast-host" aria-live="polite" aria-atomic="true">
      {items.map((t) => (
        <ToastView key={t.id} item={t} onClose={() => remove(t.id)} />
      ))}
    </div>,
    target
  );
}

/**
 * @param {{ item: ToastItem, onClose: () => void }} props
 */
function ToastView({ item, onClose }) {
  const { type, msg, duration = 2500, action } = item;
  const timerRef = useRef(/** @type {number|undefined} */(undefined));
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(onClose, 150);
    }, duration);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [duration, onClose]);

  const onAction = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    try { action?.onClick(); } finally { onClose(); }
  };

  return (
    <div role="status" className={`toast ${type} ${leaving ? 'toast-leave' : 'toast-enter'}`}>
      <span className="toast-msg">{msg}</span>
      {action && (
        <button className="toast-action" onClick={onAction} aria-label={action.label}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export const toast = {
  /** @param {string} msg */
  success: (msg) => pushFn?.({ id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`), type: 'success', msg }),
  /** @param {string} msg */
  error: (msg) => pushFn?.({ id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`), type: 'error', msg }),
  /** @param {string} msg */
  info: (msg) => pushFn?.({ id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`), type: 'info', msg }),
  /**
   * Info toast with action and custom duration
   * @param {string} msg
   * @param {number} duration
   * @param {{label: string, onClick: () => void}} action
   */
  infoAction: (msg, duration, action) => pushFn?.({ id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`), type: 'info', msg, duration, action }),
};
