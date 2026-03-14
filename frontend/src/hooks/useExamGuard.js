import { useEffect, useCallback, useRef, useState } from 'react';
import api from '../utils/axiosMock';

export default function useExamGuard({ onViolation, onAutoSubmit, examId }) {
  const [violations, setViolations] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const maxViolations = 3;
  const violationRef = useRef(0);

  const addWarning = useCallback((type, message) => {
    const id = Date.now();
    violationRef.current += 1;
    setViolations(violationRef.current);

    const warning = { id, type, message, count: violationRef.current, max: maxViolations };
    setWarnings((prev) => [...prev, warning]);

    if (onViolation) onViolation(warning);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setWarnings((prev) => prev.filter((w) => w.id !== id));
    }, 5000);

    // Auto-submit on 3rd violation
    if (violationRef.current >= maxViolations && onAutoSubmit) {
      onAutoSubmit();
    }
  }, [onViolation, onAutoSubmit]);

  useEffect(() => {
    // Fullscreen request
    const requestFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    };
    requestFullscreen();

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addWarning('fullscreen', 'Fullscreen mode exited. Please return to fullscreen.');
        requestFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) {
        addWarning('tab-switch', 'Tab switch detected. Stay on this page during the exam.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Window blur
    const handleBlur = () => {
      addWarning('focus-loss', 'Window focus lost. Do not navigate away from the exam.');
    };
    window.addEventListener('blur', handleBlur);

    // Right-click
    const handleContext = (e) => {
      e.preventDefault();
      addWarning('right-click', 'Right-click is disabled during the exam.');
    };
    document.addEventListener('contextmenu', handleContext);

    // Keyboard shortcuts
    const handleKeydown = (e) => {
      const blocked = [
        (e.ctrlKey || e.metaKey) && e.key === 'c',
        (e.ctrlKey || e.metaKey) && e.key === 'v',
        (e.ctrlKey || e.metaKey) && e.key === 'u',
        (e.ctrlKey || e.metaKey) && e.key === 's',
        (e.ctrlKey || e.metaKey) && e.key === 'p',
        e.key === 'F12',
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        addWarning('keyboard', 'Blocked keyboard shortcut detected.');
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // Auto-save every 60 seconds
    const autoSaveInterval = setInterval(() => {
      api.post('/exams/autosave', { examId, timestamp: Date.now() });
    }, 60000);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('keydown', handleKeydown);
      clearInterval(autoSaveInterval);
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [addWarning, examId]);

  const dismissWarning = useCallback((id) => {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { violations, warnings, dismissWarning };
}
