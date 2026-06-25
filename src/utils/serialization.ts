// =============================================
// Serialization — تحويل آمن بين Runtime و DB
// =============================================

import type { SerializedNode, SerializedEdge } from '../types/project';
import { findIcon } from '../constants/libraryItems';

// Maximum data size before warning (10 MB)
const MAX_DATA_SIZE_BYTES = 10 * 1024 * 1024;

// -----------------------------------------------
// Serialize Nodes — strip non-serializable fields
// -----------------------------------------------
export function serializeNodes(nodes: any[]): SerializedNode[] {
  return nodes.map(({ data, id, type, position, style, measured, ...rest }) => ({
    id,
    type: type || 'default',
    position: {
      x: Math.round((position?.x ?? 0) * 100) / 100,
      y: Math.round((position?.y ?? 0) * 100) / 100,
    },
    data: {
      label:    data?.label ?? '',
      subLabel: data?.subLabel || undefined,
      variant:  data?.variant ?? 'wireframe',
      color:    data?.color || undefined,
      url:      data?.url || undefined,
      shape:    data?.shape || undefined,
      imageUrl: data?.imageUrl || undefined,
      videoUrl: data?.videoUrl || undefined,
      // `icon` intentionally omitted — restored on load via findIcon(label)
    },
    // Preserve style (width/height) and measured dimensions
    ...(style ? { style } : {}),
    ...(measured ? { measured } : {}),
  }));
}

// -----------------------------------------------
// Serialize Edges — clean up edge data
// -----------------------------------------------
export function serializeEdges(edges: any[]): SerializedEdge[] {
  return edges.map(({ id, source, target, sourceHandle, targetHandle, label, animated, style, type, data }) => ({
    id,
    source,
    target,
    ...(sourceHandle ? { sourceHandle } : {}),
    ...(targetHandle ? { targetHandle } : {}),
    ...(label ? { label } : {}),
    animated: animated ?? true,
    ...(style ? { style } : {}),
    type: type || 'default',
    data: data ?? {},
  }));
}

// -----------------------------------------------
// Deserialize Nodes — restore icons from labels
// -----------------------------------------------
export function deserializeNodes(nodes: SerializedNode[]): any[] {
  if (!Array.isArray(nodes)) return [];
  
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      icon: findIcon(node.data?.label ?? ''),
    },
  }));
}

// -----------------------------------------------
// Validate Project Data — catch issues before save
// -----------------------------------------------
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  cleanedNodes: SerializedNode[];
  cleanedEdges: SerializedEdge[];
}

export function validateProjectData(
  nodes: SerializedNode[],
  edges: SerializedEdge[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Ensure arrays
  if (!Array.isArray(nodes)) {
    errors.push('nodes is not an array');
    return { valid: false, errors, warnings, cleanedNodes: [], cleanedEdges: [] };
  }
  if (!Array.isArray(edges)) {
    errors.push('edges is not an array');
    return { valid: false, errors, warnings, cleanedNodes: nodes, cleanedEdges: [] };
  }

  // 2. Check for duplicate node IDs
  const nodeIds = new Set<string>();
  const cleanedNodes = nodes.filter((node) => {
    if (!node.id) {
      warnings.push('Node without ID found — removed');
      return false;
    }
    if (nodeIds.has(node.id)) {
      warnings.push(`Duplicate node ID "${node.id}" — removed duplicate`);
      return false;
    }
    nodeIds.add(node.id);
    return true;
  });

  // 3. Remove orphan edges (edges pointing to non-existent nodes)
  const cleanedEdges = edges.filter((edge) => {
    if (!edge.source || !edge.target) {
      warnings.push(`Edge "${edge.id}" has missing source/target — removed`);
      return false;
    }
    if (!nodeIds.has(edge.source)) {
      warnings.push(`Edge "${edge.id}" references non-existent source "${edge.source}" — removed`);
      return false;
    }
    if (!nodeIds.has(edge.target)) {
      warnings.push(`Edge "${edge.id}" references non-existent target "${edge.target}" — removed`);
      return false;
    }
    return true;
  });

  // 4. Check data size
  const size = estimateDataSize(cleanedNodes, cleanedEdges);
  if (size > MAX_DATA_SIZE_BYTES) {
    warnings.push(
      `Data size (${(size / 1024 / 1024).toFixed(1)} MB) exceeds recommended limit (${MAX_DATA_SIZE_BYTES / 1024 / 1024} MB). Large Base64 images may cause save failures.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleanedNodes,
    cleanedEdges,
  };
}

// -----------------------------------------------
// Estimate data size in bytes
// -----------------------------------------------
export function estimateDataSize(
  nodes: SerializedNode[],
  edges: SerializedEdge[]
): number {
  const jsonStr = JSON.stringify({ nodes, edges });
  // UTF-8 encoding: most chars = 1 byte, but count carefully
  return new Blob([jsonStr]).size;
}

// -----------------------------------------------
// Generate unique node ID
// -----------------------------------------------
export function generateNodeId(): string {
  // Combines timestamp + random for guaranteed uniqueness even on rapid creation
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
