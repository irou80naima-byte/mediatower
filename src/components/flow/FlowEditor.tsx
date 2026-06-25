// =============================================
// FlowEditor — المحرر الرئيسي للـ Flow
// =============================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus,
  Type,
  LayoutGrid,
  Link as LinkIcon,
  Maximize,
  Filter,
  Download,
  Share2,
  Monitor,
  Sparkles,
  Save,
  Cloud,
  CloudOff,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { generateFlow } from '../../services/geminiService';

import type { Project, LibraryCategory, LibraryItem, SaveStatus } from '../../types/project';
import { LIBRARY_ITEMS, findIcon, getYoutubeThumbnail } from '../../constants/libraryItems';
import { deserializeNodes, generateNodeId } from '../../utils/serialization';
import { useSaveManager } from '../../hooks/useSaveManager';
import { nodeTypes } from './CustomNode';
import NodeInspector from './NodeInspector';
import LibraryPanel from './LibraryPanel';
import FlowToolbar from './FlowToolbar';

interface FlowEditorProps {
  project: Project;
  onBack: () => void;
  onSave: (id: string, name: string, nodes: any[], edges: any[]) => Promise<void>;
}

export default function FlowEditor({ project, onBack, onSave }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [projectName, setProjectName] = useState(project.name);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [complexity, setComplexity] = useState("Standard");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LibraryCategory>('wireframe');
  const [searchQuery, setSearchQuery] = useState("");
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn: rfZoomIn, zoomOut: rfZoomOut, getZoom } = useReactFlow();
  const [zoomLevel, setZoomLevel] = useState(100);

  // ===== Save Manager Hook =====
  const {
    saveStatus,
    manualSave,
    hasUnsavedChanges,
    validationWarnings,
  } = useSaveManager({
    projectId: project.id,
    projectName,
    nodes,
    edges,
    onSave,
    debounceMs: 2000,
    maxRetries: 3,
    enabled: hasLoaded,
  });

  // ===== Load project data on mount =====
  useEffect(() => {
    if (project.data) {
      const restoredNodes = deserializeNodes(project.data.nodes || []);
      setNodes(restoredNodes);
      setEdges(project.data.edges || []);
      setProjectName(project.name);
    }
    // Small delay to prevent auto-save from triggering during initial load
    const timer = setTimeout(() => setHasLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [project.id, setNodes, setEdges]);

  // ===== Zoom controls =====
  const handleZoomIn = () => {
    rfZoomIn({ duration: 200 });
    setTimeout(() => setZoomLevel(Math.round(getZoom() * 100)), 220);
  };
  const handleZoomOut = () => {
    rfZoomOut({ duration: 200 });
    setTimeout(() => setZoomLevel(Math.round(getZoom() * 100)), 220);
  };

  // ===== Drag & Drop =====
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const itemData = JSON.parse(event.dataTransfer.getData('application/reactflow/data'));

      if (typeof type === 'undefined' || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const variant = itemData.variant || activeTab;
      const originalItem = LIBRARY_ITEMS[activeTab]?.find(i => i.label === itemData.label);

      const newNode = {
        id: generateNodeId(),
        type: 'default',
        position,
        data: {
          label: itemData.label,
          variant: variant,
          icon: originalItem?.icon || null,
          shape: originalItem?.shape || itemData.shape,
        },
        style:
          variant === 'shape'
            ? { width: 120, height: 120 }
            : variant === 'image' || variant === 'video' || activeTab === 'wireframe'
              ? { width: 140, height: 175 }
              : undefined,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, activeTab, setNodes]
  );

  // ===== Keyboard shortcuts =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ===== Connection validation =====
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      if (source === target) return false;
      return true;
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6,4' },
            type: 'default',
            deletable: true,
          } as any,
          eds
        )
      ),
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const defaultEdgeOptions = {
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6,4' },
    type: 'default',
  };

  // ===== Node operations =====
  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
    if (isLibraryOpen) setIsLibraryOpen(false);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    if (isLibraryOpen) setIsLibraryOpen(false);
  };

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  };

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === id) {
                return {
                  ...node,
                  data: { ...node.data, imageUrl },
                  style: { ...node.style, width: img.width, height: img.height + 20 },
                };
              }
              return node;
            })
          );
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string;
        updateNodeData(id, { videoUrl, label: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleYoutubeUrlChange = (id: string, url: string) => {
    const thumbnailUrl = getYoutubeThumbnail(url);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              videoUrl: url,
              imageUrl: thumbnailUrl || node.data.imageUrl,
            },
          };
        }
        return node;
      })
    );
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNode(null);
  };

  const addNodeFromLibrary = (item: LibraryItem) => {
    const id = generateNodeId();
    const newNode: Node = {
      id,
      type: 'default',
      position: { x: Math.random() * 200 + 200, y: Math.random() * 200 + 200 },
      data: {
        label: item.label,
        variant: item.variant || activeTab,
        shape: item.shape,
        icon: item.icon,
      },
      style:
        activeTab === 'shape'
          ? { width: 120, height: 120 }
          : item.variant === 'image' || item.variant === 'video' || activeTab === 'wireframe'
            ? { width: 140, height: 175 }
            : undefined,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addTextNode = () => {
    const id = generateNodeId();
    const newNode: Node = {
      id,
      type: 'default',
      position: { x: Math.random() * 200 + 200, y: Math.random() * 200 + 200 },
      data: {
        label: 'Annotation',
        variant: 'text',
      },
      style: { width: 150, height: 100 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // ===== AI Generate =====
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateFlow(prompt, complexity);
      const newNodes: Node[] = data.nodes.map((n: any) => ({
        id: n.id,
        type: 'default',
        position: { x: n.x, y: n.y },
        data: { label: n.label, color: n.color || '#3b82f6' },
      }));
      const newEdges: Edge[] = data.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6,4' },
        type: 'default',
      }));
      setNodes(newNodes);
      setEdges(newEdges);
      setPrompt("");
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ===== Export =====
  const exportAsPng = () => {
    if (reactFlowWrapper.current) {
      toPng(reactFlowWrapper.current, { backgroundColor: '#fff' }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mediatower-plan-diagram.png';
        link.href = dataUrl;
        link.click();
      });
    }
  };

  // ===== Save Status UI Helper =====
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-amber-500">
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            جاري الحفظ...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1.5 text-emerald-500">
            <Cloud className="w-3.5 h-3.5" />
            تم الحفظ
          </span>
        );
      case 'unsaved':
        return (
          <span className="flex items-center gap-1.5 text-gray-400">
            <CloudOff className="w-3.5 h-3.5" />
            تغييرات غير محفوظة
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-red-500">
            <CloudOff className="w-3.5 h-3.5" />
            خطأ في الحفظ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={onBack}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Mediatower PLAN</h1>
          </div>
          <div className="h-6 w-[1px] bg-gray-200" />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-md border border-gray-100 font-medium text-gray-500 text-sm outline-none transition-all w-auto min-w-[100px]"
            style={{ width: `${Math.max(projectName.length, 8)}ch` }}
            placeholder="Untitled"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs font-medium px-2">
            {renderSaveStatus()}
          </div>

          {/* Manual save button */}
          {nodes.length > 0 && (
            <button
              onClick={manualSave}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 active:scale-95",
                saveStatus === 'saved'
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                  : saveStatus === 'saving'
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-700 shadow-md shadow-gray-200"
              )}
            >
              <Save className="w-4 h-4" />
              {saveStatus === 'saving' ? 'حفظ...' : saveStatus === 'saved' ? 'محفوظ' : 'حفظ'}
            </button>
          )}

          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Monitor className="w-4 h-4" /> Preview
          </button>
          <button onClick={exportAsPng} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-100">
            <Download className="w-4 h-4" /> PNG
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-100">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Flow Canvas */}
      <div className="flex-1 relative flex" ref={reactFlowWrapper}>
        {/* Library Panel */}
        <AnimatePresence>
          {isLibraryOpen && (
            <LibraryPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAddNode={addNodeFromLibrary}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </AnimatePresence>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onEdgeClick={onEdgeClick}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          zoomActivationKeyCode="Control"
          deleteKeyCode="Delete"
          edgesReconnectable={true}
          connectionLineStyle={{ stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' }}
          connectionLineOptions={{ animated: true }}
          defaultEdgeOptions={defaultEdgeOptions}
          className={cn("bg-white", isCtrlPressed ? "cursor-zoom-in" : "")}
        >
          {/* Left toolbar */}
          <Panel position="top-left" className="ml-4 mt-4 flex flex-col gap-2 z-[80]">
            <div className="flex flex-col bg-white rounded-xl shadow-xl border border-gray-100 p-1">
              <button
                onClick={(e) => { e.stopPropagation(); setIsLibraryOpen(!isLibraryOpen); }}
                className={cn("p-3 rounded-lg transition-all active:scale-95", isLibraryOpen ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50")}
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={addTextNode}
                className="p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <Type className="w-5 h-5" />
              </button>
            </div>
          </Panel>

          {/* Node Inspector */}
          <AnimatePresence mode="wait">
            {selectedNode && (() => {
              const liveNode = nodes.find(n => n.id === selectedNode.id) ?? selectedNode;
              return (
                <Panel position="top-left" style={{ marginLeft: '80px', marginTop: '20px' }} className="z-[90]">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    style={{ width: '240px', maxHeight: '80vh' }}
                    className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col p-4 overflow-y-auto"
                  >
                    <NodeInspector
                      selectedNode={selectedNode}
                      liveNode={liveNode}
                      onUpdateNodeData={updateNodeData}
                      onDeleteNode={deleteNode}
                      onImageUpload={handleImageUpload}
                      onVideoUpload={handleVideoUpload}
                      onYoutubeUrlChange={handleYoutubeUrlChange}
                    />
                  </motion.div>
                </Panel>
              );
            })()}
          </AnimatePresence>

          {/* Bottom left toolbar */}
          <Panel position="bottom-left" className="ml-4 mb-4 flex items-center gap-2">
            <div className="flex items-center bg-white rounded-xl shadow-xl border border-gray-100 p-1">
              <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-lg"><LayoutGrid className="w-5 h-5" /></button>
              <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-lg"><LinkIcon className="w-5 h-5" /></button>
              <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-lg"><Maximize className="w-5 h-5" /></button>
              <div className="h-6 w-[1px] bg-gray-100 mx-1" />
              <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm"><Filter className="w-4 h-4" /> Funnel</button>
            </div>
          </Panel>

          {/* Zoom controls */}
          <Panel position="right" className="mr-4 flex flex-col gap-2 z-[80] top-1/2 -translate-y-1/2 absolute">
            <div className="flex flex-col items-center bg-white rounded-xl shadow-xl border border-gray-100 p-1">
              <button onClick={handleZoomIn} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all active:scale-95">
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-full h-[1px] bg-gray-100 my-1" />
              <span className="text-xs font-bold text-gray-500 py-1 w-10 text-center select-none">{zoomLevel}%</span>
              <div className="w-full h-[1px] bg-gray-100 my-1" />
              <button onClick={handleZoomOut} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all active:scale-95">
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
          </Panel>

          {/* AI Generation Toolbar */}
          <Panel position="bottom-center" className="mb-8 w-full max-w-2xl px-4">
            <FlowToolbar
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              complexity={complexity}
              onComplexityChange={setComplexity}
            />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
