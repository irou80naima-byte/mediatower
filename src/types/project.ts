// =============================================
// Mediatower PLAN — Central Type Definitions
// =============================================

import type { ComponentType } from 'react';

// ===== Node Data (Runtime — includes non-serializable fields) =====
export interface FlowNodeData {
  label: string;
  subLabel?: string;
  variant: 'wireframe' | 'shape' | 'social' | 'text' | 'image' | 'video' | 'video_upload' | 'notepad';
  color?: string;
  url?: string;
  shape?: 'circle' | 'diamond' | 'rectangle' | 'triangle' | 'round-rectangle';
  imageUrl?: string;
  videoUrl?: string;
  icon?: ComponentType<any>; // ⚠️ Non-serializable — restored on load via findIcon()
}

// ===== Serialized Node Data (safe for JSON / DB) =====
export interface SerializedNodeData {
  label: string;
  subLabel?: string;
  variant: string;
  color?: string;
  url?: string;
  shape?: string;
  imageUrl?: string;
  videoUrl?: string;
}

// ===== Serialized Node (full node safe for persistence) =====
export interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: SerializedNodeData;
  style?: Record<string, any>;
  measured?: { width: number; height: number };
}

// ===== Serialized Edge =====
export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
  type?: string;
  data?: Record<string, any>;
}

// ===== Project =====
export interface Project {
  id: string;
  name: string;
  lastModified: number;
  data: {
    nodes: SerializedNode[];
    edges: SerializedEdge[];
  } | null; // null = project listed but data not fetched yet
}

// ===== Save Status =====
export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

// ===== Library Item =====
export interface LibraryItem {
  label: string;
  icon: ComponentType<any>;
  variant?: string;
  shape?: string;
}

export type LibraryCategory = 'wireframe' | 'shape' | 'social';
