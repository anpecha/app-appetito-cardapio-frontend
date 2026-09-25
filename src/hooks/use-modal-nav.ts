'use client';

import { useEffect, useRef } from 'react';

export function useModalNav(isOpen: boolean, onClose: () => void) {
  const modalId = useRef(`appetito-modal-${Math.random().toString(36).slice(2)}`);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let closedByBrowserBack = false;
    const state = window.history.state;

    // Each open panel is a navigation step: browser back closes it instead of
    // leaving the cardápio while the customer is still in the flow.
    window.history.pushState(
      { ...state, appetitoModal: modalId.current },
      '',
      window.location.href
    );

    const handlePopState = () => {
      closedByBrowserBack = true;
      onCloseRef.current();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;

      // UI close also removes the history entry. Browser back already did it.
      if (!closedByBrowserBack && window.history.state?.appetitoModal === modalId.current) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
