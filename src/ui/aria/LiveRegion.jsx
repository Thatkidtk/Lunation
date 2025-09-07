import React, { useEffect, useRef, useState } from 'react';

/** @type {(msg: string) => void} */
let announceFn;

export function LiveRegion() {
  const [message, setMessage] = useState('');
  const timerRef = useRef(/** @type {number|undefined} */(undefined));

  useEffect(() => {
    announceFn = (msg) => {
      setMessage(''); // reset to force SR announcement
      // small delay then set
      window.setTimeout(() => setMessage(msg), 10);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setMessage(''), 3000);
    };
    return () => { announceFn = undefined; if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, []);

  return (
    <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' }}>
      {message}
    </div>
  );
}

/**
 * Send a polite screen reader announcement
 * @param {string} msg
 */
export function ariaAnnounce(msg) {
  announceFn?.(msg);
}

