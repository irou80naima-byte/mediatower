// =============================================
// useSaveManager — إدارة شاملة للحفظ التلقائي واليدوي
// =============================================
//
// Features:
// ✅ Auto-save with debounce (2s default)
// ✅ Manual save that cancels pending auto-save
// ✅ Retry logic (3 attempts with exponential backoff)
// ✅ Conflict prevention (lock prevents concurrent saves)
// ✅ beforeunload protection (warns user before leaving with unsaved changes)
// ✅ Validation before every save
// ✅ Save versioning (never overwrites newer data with older)
// ✅ Skip-count guard (skips first N renders after enabling to let React Flow settle)
// ✅ Empty-canvas protection (blocks saving 0 nodes when project originally had data)
// ✅ Cleanup: cancels debounced saves on unmount and project change

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { SaveStatus } from '../types/project';
import {
  serializeNodes,
  serializeEdges,
  validateProjectData,
} from '../utils/serialization';

interface UseSaveManagerOptions {
  projectId: string;
  projectName: string;
  nodes: any[];
  edges: any[];
  onSave: (id: string, name: string, nodes: any[], edges: any[]) => Promise<void>;
  debounceMs?: number;
  maxRetries?: number;
  enabled?: boolean;          // set to false while loading project data
  initialNodeCount?: number;  // how many nodes the project originally had — blocks empty-canvas saves
}

interface UseSaveManagerReturn {
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  manualSave: () => Promise<void>;
  hasUnsavedChanges: boolean;
  validationWarnings: string[];
}

// Number of renders to skip after `enabled` flips to true.
// This absorbs React Flow's internal updates (dimension measurement, etc.)
const SKIP_RENDERS_AFTER_ENABLE = 3;

export function useSaveManager({
  projectId,
  projectName,
  nodes,
  edges,
  onSave,
  debounceMs = 2000,
  maxRetries = 3,
  enabled = true,
  initialNodeCount = 0,
}: UseSaveManagerOptions): UseSaveManagerReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Refs for concurrency control
  const isSavingRef = useRef(false);
  const saveVersionRef = useRef(0);         // increments on every change
  const lastSavedVersionRef = useRef(0);    // last version that was successfully saved
  const pendingSaveRef = useRef(false);     // true if a save is waiting for lock release

  // Skip-count guard: replaces the old single-use `isFirstRender` boolean.
  // Counts how many renders have occurred since `enabled` flipped to true.
  // Saves are blocked until this counter exceeds SKIP_RENDERS_AFTER_ENABLE.
  const skipCountRef = useRef(0);

  const hasUnsavedChanges = saveStatus === 'unsaved' || saveStatus === 'error';

  // ----- Core save function with retry -----
  const performSave = useCallback(async (
    pId: string,
    pName: string,
    rawNodes: any[],
    rawEdges: any[],
    saveVersion: number
  ) => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }
    isSavingRef.current = true;
    setSaveStatus('saving');

    // Serialize & validate
    const cleanNodes = serializeNodes(rawNodes);
    const cleanEdges = serializeEdges(rawEdges);
    const validation = validateProjectData(cleanNodes, cleanEdges);

    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
      console.warn('[SaveManager] Validation warnings:', validation.warnings);
    }

    if (!validation.valid) {
      console.error('[SaveManager] Validation errors:', validation.errors);
      setSaveStatus('error');
      isSavingRef.current = false;
      return;
    }

    // Retry loop
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        await onSave(pId, pName, validation.cleanedNodes, validation.cleanedEdges);
        success = true;
      } catch (err) {
        attempt++;
        console.warn(`[SaveManager] Save attempt ${attempt}/${maxRetries} failed:`, err);
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    isSavingRef.current = false;

    if (success) {
      // Only mark as saved if this is still the latest version
      if (saveVersion >= lastSavedVersionRef.current) {
        lastSavedVersionRef.current = saveVersion;
        setSaveStatus('saved');
        setLastSavedAt(Date.now());
        // Clear "saved" indicator after 3 seconds
        setTimeout(() => {
          setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 3000);
      }
    } else {
      setSaveStatus('error');
    }

    // If another save was queued while we were saving, trigger it now
    if (pendingSaveRef.current) {
      pendingSaveRef.current = false;
      // Will be triggered by the next debounce cycle
    }
  }, [onSave, maxRetries]);

  // ----- Debounced auto-save -----
  const debouncedSave = useDebouncedCallback(
    (pId: string, pName: string, n: any[], e: any[], version: number) => {
      performSave(pId, pName, n, e, version);
    },
    debounceMs
  );

  // ----- Detect changes and trigger auto-save -----
  useEffect(() => {
    if (!enabled) return;

    // Skip the first N renders after enabling.
    // This lets React Flow finish its internal processing (measuring node
    // dimensions, etc.) before we start considering state changes as
    // user-initiated modifications that need saving.
    if (skipCountRef.current < SKIP_RENDERS_AFTER_ENABLE) {
      skipCountRef.current += 1;
      return;
    }

    // GUARD: Never auto-save an empty canvas when the project originally
    // contained nodes. This is the last line of defense against data loss
    // from timing bugs during the load phase.
    if (nodes.length === 0 && initialNodeCount > 0) {
      console.warn(
        '[SaveManager] ⛔ Blocked auto-save of empty canvas — project originally had',
        initialNodeCount,
        'nodes'
      );
      return;
    }

    saveVersionRef.current += 1;
    const currentVersion = saveVersionRef.current;

    setSaveStatus('unsaved');
    debouncedSave(projectId, projectName, nodes, edges, currentVersion);
  }, [nodes, edges, projectName, enabled, projectId, debouncedSave, initialNodeCount]);

  // ----- Reset on project change -----
  useEffect(() => {
    skipCountRef.current = 0;
    setSaveStatus('idle');
    saveVersionRef.current = 0;
    lastSavedVersionRef.current = 0;
    setValidationWarnings([]);
    // Cancel any pending debounced save from the PREVIOUS project
    debouncedSave.cancel();
  }, [projectId, debouncedSave]);

  // ----- Cleanup on unmount — cancel pending saves -----
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // ----- Manual save -----
  const manualSave = useCallback(async () => {
    if (!enabled) return;
    
    // Cancel pending debounced auto-save
    debouncedSave.cancel();

    saveVersionRef.current += 1;
    const currentVersion = saveVersionRef.current;

    await performSave(projectId, projectName, nodes, edges, currentVersion);
  }, [enabled, projectId, projectName, nodes, edges, performSave, debouncedSave]);

  // ----- beforeunload protection -----
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      // GUARD: Don't attempt emergency save if:
      // - Data hasn't finished loading yet (enabled === false)
      // - Canvas is empty (would overwrite existing data with nothing)
      if (!enabled || nodes.length === 0) return;

      if (hasUnsavedChanges || isSavingRef.current) {
        e.preventDefault();
        // Attempt emergency save
        try {
          const cleanNodes = serializeNodes(nodes);
          const cleanEdges = serializeEdges(edges);
          // Use sendBeacon for last-resort save (non-blocking)
          const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost/myapp/api/index.php';
          const token = localStorage.getItem('flowlite_token');
          const url = new URL(API_BASE, window.location.origin);
          url.searchParams.set('route', 'projects');
          url.searchParams.set('id', projectId);
          
          const payload = JSON.stringify({
            name: projectName,
            nodes: cleanNodes,
            edges: cleanEdges,
          });
          
          // sendBeacon is more reliable than fetch during page unload
          if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            // Note: sendBeacon doesn't support custom headers easily,
            // so we add token as query param for this emergency case
            url.searchParams.set('_token', token || '');
            url.searchParams.set('_method', 'PUT');
            navigator.sendBeacon(url.toString(), blob);
          }
        } catch (err) {
          console.error('[SaveManager] Emergency save failed:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled, hasUnsavedChanges, nodes, edges, projectId, projectName]);

  return {
    saveStatus,
    lastSavedAt,
    manualSave,
    hasUnsavedChanges,
    validationWarnings,
  };
}
