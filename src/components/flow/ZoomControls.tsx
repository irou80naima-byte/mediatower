// =============================================
// ZoomControls — تحكم احترافي بالتكبير والتصغير
// =============================================
//
// Features:
// ✅ Real-time viewport zoom tracking via useOnViewportChange
// ✅ Smooth zoom in/out with easing (250ms)
// ✅ Press-and-hold for continuous zoom
// ✅ Click percentage to reset to 100%
// ✅ Fit-to-view button (appears on hover)
// ✅ Keyboard shortcuts: Ctrl+= / Ctrl+- / Ctrl+0 / Ctrl+1
// ✅ Visual progress bar showing zoom level
// ✅ Disabled states at min/max limits
// ✅ Glassmorphism + micro-animations
// =============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useReactFlow, useOnViewportChange } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// Match the minZoom / maxZoom props on <ReactFlow>
const MIN_ZOOM_PERCENT = 10;
const MAX_ZOOM_PERCENT = 400;
const ZOOM_RANGE = MAX_ZOOM_PERCENT - MIN_ZOOM_PERCENT;

export default function ZoomControls() {
  const { zoomIn, zoomOut, fitView, setViewport, getViewport } = useReactFlow();
  const [zoom, setZoom] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs for press-and-hold continuous zoom
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Initialize zoom from current viewport ──
  useEffect(() => {
    try {
      setZoom(Math.round(getViewport().zoom * 100));
    } catch {
      // getViewport may not be ready yet
    }
  }, [getViewport]);

  // ── Track viewport changes in real-time ──
  useOnViewportChange({
    onChange: useCallback((vp: { zoom: number }) => {
      setZoom(Math.round(vp.zoom * 100));
    }, []),
  });

  // ── Zoom actions ──
  const doZoomIn = useCallback(() => {
    zoomIn({ duration: 250 });
  }, [zoomIn]);

  const doZoomOut = useCallback(() => {
    zoomOut({ duration: 250 });
  }, [zoomOut]);

  const doFitView = useCallback(() => {
    fitView({ duration: 400, padding: 0.15 });
  }, [fitView]);

  const doResetZoom = useCallback(() => {
    const vp = getViewport();
    setViewport({ ...vp, zoom: 1 }, { duration: 300 });
  }, [getViewport, setViewport]);

  // ── Press-and-hold for continuous zoom ──
  const startHold = useCallback(
    (direction: 'in' | 'out') => {
      const fn = direction === 'in' ? doZoomIn : doZoomOut;
      fn(); // immediate first action
      holdTimerRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(fn, 120);
      }, 350);
    },
    [doZoomIn, doZoomOut],
  );

  const stopHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopHold(), [stopHold]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;

      switch (e.key) {
        case '=':
        case '+':
          e.preventDefault();
          doZoomIn();
          break;
        case '-':
          e.preventDefault();
          doZoomOut();
          break;
        case '0':
          e.preventDefault();
          doResetZoom();
          break;
        case '1':
          e.preventDefault();
          doFitView();
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doZoomIn, doZoomOut, doResetZoom, doFitView]);

  // ── Derived state ──
  const isAtMin = zoom <= MIN_ZOOM_PERCENT;
  const isAtMax = zoom >= MAX_ZOOM_PERCENT;
  const progress = Math.max(0, Math.min(1, (zoom - MIN_ZOOM_PERCENT) / ZOOM_RANGE));

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        stopHold();
      }}
    >
      {/* ── Main controls card ── */}
      <div className="flex flex-col items-center bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200/60 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
        {/* Zoom In */}
        <button
          onMouseDown={() => startHold('in')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={isAtMax}
          className={cn(
            'p-2.5 transition-all duration-150 active:scale-90',
            isAtMax
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/60',
          )}
          title="تكبير (Ctrl +)"
        >
          <ZoomIn className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>

        {/* Progress bar — visualizes current zoom level */}
        <div className="relative w-7 h-[2px] bg-gray-100 overflow-hidden rounded-full">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>

        {/* Zoom Percentage — click to reset to 100% */}
        <button
          onClick={doResetZoom}
          className="group relative py-1.5 px-1.5 min-w-[50px] text-center"
          title="إعادة التعيين إلى 100% (Ctrl + 0)"
        >
          <span
            className={cn(
              'text-[11px] font-bold tabular-nums tracking-tight block transition-colors duration-200',
              zoom === 100
                ? 'text-blue-600'
                : 'text-gray-500 group-hover:text-gray-800',
            )}
          >
            {zoom}%
          </span>
          {/* Hover overlay — shows reset target */}
          {zoom !== 100 && (
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-blue-50/90 rounded text-[10px] font-bold text-blue-600 pointer-events-none">
              100%
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-7 h-[2px] bg-gray-100 rounded-full" />

        {/* Zoom Out */}
        <button
          onMouseDown={() => startHold('out')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          disabled={isAtMin}
          className={cn(
            'p-2.5 transition-all duration-150 active:scale-90',
            isAtMin
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/60',
          )}
          title="تصغير (Ctrl -)"
        >
          <ZoomOut className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
      </div>

      {/* ── Fit View — appears on hover ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={doFitView}
              className="p-2.5 bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-200/60 text-gray-500 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-150 active:scale-90"
              title="ملاءمة العرض (Ctrl + 1)"
            >
              <Maximize className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
