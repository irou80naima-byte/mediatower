import React, { useState, useCallback, useRef } from 'react';
import localforage from 'localforage';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
  Handle,
  Position,
  NodeResizer,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus,
  Type,
  LayoutGrid,
  Link as LinkIcon,
  Maximize,
  Filter,
  Trash2,
  Download,
  Share2,
  Monitor,
  Sparkles,
  Palette,
  X,
  Search,
  Globe,
  Layout,
  FileText,
  Image as ImageIcon,
  List,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Star,
  Tag,
  Zap,
  BarChart,
  Table as TableIcon,
  MessageSquare,
  LogIn,
  UserPlus,
  AlertCircle,
  User,
  CheckCircle,
  Circle as CircleIcon,
  Square,
  Diamond,
  Triangle as TriangleIcon,
  Facebook,
  Instagram,
  Linkedin,
  Github as GithubIcon,
  Youtube as YoutubeIcon,
  Slack as SlackIcon,
  Twitter,
  Mail as MailIcon,
  Video,
  ZoomIn,
  ZoomOut,
  Notebook,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { projects as apiProjects } from './services/apiClient';
import { auth as apiAuth } from './services/apiClient';


export interface Project {
  id: string;
  name: string;
  lastModified: number;
  data: {
    nodes: any[];
    edges: any[];
  };
}

const getYoutubeThumbnail = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
    : null;
};

const findIcon = (label: string) => {
  for (const category in LIBRARY_ITEMS) {
    const item = LIBRARY_ITEMS[category].find(i => i.label === label);
    if (item?.icon) return item.icon;
  }
  return null;
};

// Custom Node Component to handle different variants

const CustomNode = ({ id, data, selected }: { id: string, data: any, selected: boolean }) => {

  if (data.variant === 'shape') {
    const Shape = () => {
      const shapeContent = (
        <div className="absolute inset-0 flex flex-col items-center justify-start p-1 pt-2 text-center">
          {/* Header Bar like in the image */}
          <div className="w-4/5 h-1.5 bg-gray-400/30 rounded-full mb-2" />
          <div className="flex-1 flex items-center justify-center w-full px-2">
            <div className="font-bold text-sm text-gray-900 break-words leading-tight">{data.label}</div>
          </div>
        </div>
      );

      switch (data.shape) {
        case 'circle': return (
          <div className="relative w-full h-full rounded-full border-2 bg-white shadow-sm overflow-hidden" style={{ borderColor: data.color || '#94a3b8' }}>
            {shapeContent}
          </div>
        );
        case 'diamond': return (
          <div className="relative w-full h-full flex items-center justify-center">
             <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={data.color || "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0">
               <path d="M2.7 10.3a2.4 2.4 0 0 0 0 3.4l7.6 7.6a2.4 2.4 0 0 0 3.4 0l7.6-7.6a2.4 2.4 0 0 0 0-3.4l-7.6-7.6a2.4 2.4 0 0 0-3.4 0z" fill="white" />
             </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
               <div className="w-1/2 h-1 bg-gray-400/20 rounded-full mb-1" />
               <div className="font-bold text-xs text-gray-900 break-words leading-tight">{data.label}</div>
            </div>
          </div>
        );
        case 'triangle': return (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={data.color || "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0" preserveAspectRatio="none">
              <path d="M10.3 3.1a2.4 2.4 0 0 1 3.4 0l7.7 13.5a2.4 2.4 0 0 1-2 3.4H4.6a2.4 2.4 0 0 1-2-3.4z" fill="white" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-[20%] text-center">
              <div className="w-1/3 h-1 bg-gray-400/20 rounded-full mb-1" />
              <div className="font-bold text-[11px] text-gray-900 break-words px-4 leading-tight">{data.label}</div>
            </div>
          </div>
        );
        case 'round-rectangle': return (
          <div className="relative w-full h-full border-2 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col" style={{ borderColor: data.color || '#94a3b8' }}>
            <div className="h-4 w-full bg-gray-50 border-b border-gray-100 flex items-center px-3 gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <div className="w-8 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex-1 flex items-center justify-center p-2 text-center">
              <div className="font-bold text-sm text-gray-900 break-words leading-tight">{data.label}</div>
            </div>
          </div>
        );
        default: return (
          <div className="relative w-full h-full border-2 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ borderColor: data.color || '#94a3b8' }}>
            <div className="h-4 w-full bg-gray-50 border-b border-gray-100 flex items-center px-3 gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
               <div className="w-8 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex-1 flex items-center justify-center p-2 text-center">
              <div className="font-bold text-sm text-gray-900 break-words leading-tight">{data.label}</div>
            </div>
          </div>
        );
      }
    };

    return (
      <div className={cn("relative group transition-all rounded-[6px] p-1 w-full h-full", selected ? "shadow-[0_0_0_4px_#e9ebef]" : "")}>
        <NodeResizer 
          color="#fbbf24" 
          isVisible={selected} 
          minWidth={40} 
          minHeight={40} 
          handleStyle={{ width: '10px', height: '10px', borderRadius: '50%' }}
        />
        
        {/* Handles always visible */}
        <Handle id="top-s" type="source" position={Position.Top} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ top: '-4px', left: '50%' }} />
        <Handle id="top-t" type="target" position={Position.Top} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ top: '-4px', left: '50%' }} />
        <Handle id="bottom-s" type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ bottom: '-4px', left: '50%' }} />
        <Handle id="bottom-t" type="target" position={Position.Bottom} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ bottom: '-4px', left: '50%' }} />
        <Handle id="left-s" type="source" position={Position.Left} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ left: '-4px', top: '50%' }} />
        <Handle id="left-t" type="target" position={Position.Left} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ left: '-4px', top: '50%' }} />
        <Handle id="right-s" type="source" position={Position.Right} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ right: '-4px', top: '50%' }} />
        <Handle id="right-t" type="target" position={Position.Right} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ right: '-4px', top: '50%' }} />

        <div className="w-full h-full min-w-[80px] min-h-[80px]">
          <Shape />
        </div>

        {/* URL badge Ã¢â‚¬â€ shows below the node when a URL is set */}
        {data.url && (
          <div className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm whitespace-nowrap">
              <span className="text-xs text-gray-700 font-medium">{data.url.length > 25 ? data.url.substring(0, 25) + '...' : data.url}</span>
            </div>
          </div>
        )}
      </div>
    );
  }


  if (data.variant === 'social') {

    const Icon = data.icon || Globe;
    return (
      <div className={cn("relative transition-all rounded-xl p-1 w-full h-full flex items-center justify-center", selected ? "shadow-[0_0_0_6px_#e9ebef]" : "")}>
        <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-48 text-center z-10 pointer-events-none">
          <div className="font-bold text-2xl text-gray-900">{data.label}</div>
        </div>

        {/* Handles always visible Ã¢â‚¬â€ each position supports both source & target */}
        <Handle id="top-s" type="source" position={Position.Top} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ top: '-4px', left: '50%' }} />
        <Handle id="top-t" type="target" position={Position.Top} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ top: '-4px', left: '50%' }} />
        <Handle id="bottom-s" type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ bottom: '-4px', left: '50%' }} />
        <Handle id="bottom-t" type="target" position={Position.Bottom} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ bottom: '-4px', left: '50%' }} />
        <Handle id="left-s" type="source" position={Position.Left} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ left: '-4px', top: '50%' }} />
        <Handle id="left-t" type="target" position={Position.Left} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ left: '-4px', top: '50%' }} />
        <Handle id="right-s" type="source" position={Position.Right} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ right: '-4px', top: '50%' }} />
        <Handle id="right-t" type="target" position={Position.Right} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ right: '-4px', top: '50%' }} />

        <div
          className="p-4 bg-white rounded-xl shadow-lg flex items-center justify-center w-full h-full min-w-[80px] border-2 overflow-hidden"
          style={{ borderColor: data.color || '#f1f5f9' }}
        >
          <div className="text-gray-800">
            <Icon className="w-10 h-10" />
          </div>
        </div>
      </div>
    );
  }

  if (data.variant === 'text') {
    return (
      <div className={cn("relative transition-all p-2 w-full h-full", selected ? "border border-gray-200 bg-white/50 rounded-sm" : "border border-transparent")}>
        <NodeResizer 
          color="#fbbf24" 
          isVisible={selected} 
          minWidth={40} 
          minHeight={40} 
          handleStyle={{ width: '10px', height: '10px', borderRadius: '50%' }}
        />
        <div className="w-full h-full flex items-center justify-center whitespace-pre-wrap text-center text-gray-900 text-sm p-2">
          {data.label || 'Annotation'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-200 p-1 w-full h-full",
        selected ? "shadow-[0_0_0_6px_#e9ebef] rounded-[8px]" : ""
      )}
    >
      <NodeResizer 
        color="#fbbf24" 
        isVisible={selected} 
        minWidth={60} 
        minHeight={60} 
        handleStyle={{ width: '10px', height: '10px', borderRadius: '50%' }}
      />
      {/* Handles always visible Ã¢â‚¬â€ each position supports both source & target */}
      <Handle id="top-s" type="source" position={Position.Top} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ top: '-4px', left: '50%' }} />
      <Handle id="top-t" type="target" position={Position.Top} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ top: '-4px', left: '50%' }} />
      <Handle id="bottom-s" type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ bottom: '-4px', left: '50%' }} />
      <Handle id="bottom-t" type="target" position={Position.Bottom} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ bottom: '-4px', left: '50%' }} />
      <Handle id="left-s" type="source" position={Position.Left} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ left: '-4px', top: '50%' }} />
      <Handle id="left-t" type="target" position={Position.Left} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ left: '-4px', top: '50%' }} />
      <Handle id="right-s" type="source" position={Position.Right} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ right: '-4px', top: '50%' }} />
      <Handle id="right-t" type="target" position={Position.Right} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ right: '-4px', top: '50%' }} />

      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-56 text-center z-10 pointer-events-none">
        <div className="font-bold text-2xl whitespace-pre-wrap text-gray-900">
          {data.label}
        </div>
      </div>

      <div
        className="bg-white border-2 rounded-[8px] overflow-hidden shadow-sm w-full h-full"
        style={{ borderColor: data.color || '#94a3b8' }}
      >
        {/* Browser chrome bar */}
        <div className="h-5 flex justify-start items-center space-x-1 px-2 bg-gray-50 border-b border-gray-100">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
          <div className="ml-1 flex-1 h-2 bg-gray-200 rounded-full"></div>
          <div className="flex gap-0.5 ml-1">
            {[1, 2, 3].map(i => <div key={i} className="w-0.5 h-1 bg-gray-300 rounded-sm" />)}
          </div>
        </div>

        <div className="bg-white p-1.5 flex flex-col gap-1.5 w-full h-[calc(100%-20px)]">
          {(() => {
            const extractUrl = (text: any) => {
              if (typeof text !== 'string') return null;
              const match = text.match(/(https?:\/\/[^\s]+)/);
              return match ? match[0] : null;
            };
            const websiteUrl = data.url || extractUrl(data.label);
            const isMedia = data.variant === 'image' || data.variant === 'video' || data.variant === 'video_upload' || data.label === 'Upload Image' || data.label === 'YouTube Video' || data.label === 'Upload Video';
            
            if (data.variant === 'notepad') {
              return (
                <div className="flex-1 bg-[#fefcf0] relative flex flex-col h-full overflow-hidden p-3" style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '100% 20px' }}>
                  {/* Left margin red line */}
                  <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-red-300" />
                </div>
              );
            }

            if (isMedia) {
              return (
            <div className="flex-1 bg-white relative flex items-center justify-center overflow-hidden">
              {data.imageUrl || data.videoUrl ? (
                <div className="relative w-full h-full">
                  {data.videoUrl ? (
                    <video src={data.videoUrl} className="w-full h-full object-contain" controls={false} muted />
                  ) : (
                    <img src={data.imageUrl} className="w-full h-full object-contain" alt={data.label} />
                  )}
                  {(data.variant === 'video' || data.label === 'YouTube Video' || data.variant === 'video_upload' || data.label === 'Upload Video') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        {data.variant === 'video_upload' || data.label === 'Upload Video' ? (
                          <Video className="w-6 h-6 text-blue-600" />
                        ) : (
                          <YoutubeIcon className="w-6 h-6 text-red-600 ml-0.5" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300 p-4">
                  {data.variant === 'video' || data.label === 'YouTube Video' || data.variant === 'video_upload' || data.label === 'Upload Video' ? 
                    (data.variant === 'video_upload' || data.label === 'Upload Video' ? <Video className="w-8 h-8" /> : <YoutubeIcon className="w-8 h-8" />) 
                    : <ImageIcon className="w-8 h-8" />}
                  <span className="text-[10px] font-bold text-center">
                    {data.variant === 'video' || data.label === 'YouTube Video' ? 'Enter Video Link' : 
                     (data.variant === 'video_upload' || data.label === 'Upload Video' ? 'Upload Video' : 'Upload Image')}
                  </span>
                </div>
              )}
            </div>
              );
            }
            
            if (websiteUrl) {
              return (
                <div className="flex-1 bg-white relative flex items-center justify-center overflow-hidden rounded-sm bg-gray-50">
                  <img src={`https://api.microlink.io/?url=${encodeURIComponent(websiteUrl)}&screenshot=true&embed=screenshot.url`} className="w-full h-full object-cover object-top" alt="Website Thumbnail" onError={(e) => { 
                    if (e.currentTarget.src.includes('microlink.io')) {
                      e.currentTarget.src = `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(websiteUrl)}?w=400`;
                    } else if (e.currentTarget.src.includes('wordpress.com')) {
                      e.currentTarget.src = `https://mini.s-shot.ru/1024x768/JPEG/400/Z100/?${websiteUrl}`;
                    } else {
                      e.currentTarget.style.display = 'none'; 
                    }
                  }} />
                  <div className="absolute inset-0 border border-black/5 pointer-events-none" />
                </div>
              );
            }

            return (
              <>
                {/* Nav bar */}
              <div className="bg-gray-100 px-2 py-1 flex justify-between items-center rounded">
                <div className="h-1.5 bg-gray-300 w-4 rounded"></div>
                <div className="flex gap-1">
                  <div className="h-1 bg-gray-300 w-3 rounded"></div>
                  <div className="h-1 bg-gray-300 w-3 rounded"></div>
                  <div className="h-1 bg-gray-300 w-3 rounded"></div>
                </div>
              </div>

              {/* Hero section */}
              <div className="flex-1 bg-gray-100 rounded p-1.5 flex gap-1.5 items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 bg-gray-300 w-12 rounded"></div>
                  <div className="h-1 bg-gray-200 w-10 rounded"></div>
                  <div className="h-1 bg-gray-200 w-8 rounded"></div>
                </div>
                <div className="text-gray-300">
                  <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
              </div>

              {/* Cards row */}
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex-1 bg-gray-100 rounded p-1 flex flex-col gap-0.5">
                    <div className="h-1 bg-gray-300 w-full rounded"></div>
                    <div className="h-1 bg-gray-200 w-3/4 rounded"></div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-gray-100 px-2 py-1 flex justify-between items-center rounded">
                <div className="h-1 bg-gray-300 w-6 rounded"></div>
                <div className="flex gap-1">
                  <div className="h-1 bg-gray-200 w-2 rounded"></div>
                  <div className="h-1 bg-gray-200 w-2 rounded"></div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>

      {/* URL badge Ã¢â‚¬â€ shows below the node when a URL is set */}
      {data.url && (
        <div className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm whitespace-nowrap">
            <span className="text-xs text-gray-700 font-medium">{data.url.length > 25 ? data.url.substring(0, 25) + '...' : data.url}</span>
          </div>
        </div>
      )}
    </div>
  );
};


const nodeTypes = {
  default: CustomNode,
  input: CustomNode,
  output: CustomNode,
};

const LIBRARY_ITEMS: Record<string, any[]> = {
  wireframe: [
    { label: 'Website', icon: Globe },
    { label: 'Social Post', icon: Share2 },
    { label: 'Landing', icon: Layout },
    { label: 'About Us', icon: FileText },
    { label: 'Contact', icon: MailIcon },
    { label: 'Blog', icon: FileText },
    { label: 'Portfolio', icon: ImageIcon },
    { label: 'Files', icon: FileText },
    { label: 'AI', icon: Sparkles },
    { label: 'AI 2', icon: Sparkles },
    { label: 'Search', icon: Search },
    { label: 'Product List', icon: List },
    { label: 'Product', icon: ShoppingBag },
    { label: 'Shopping Cart', icon: ShoppingCart },
    { label: 'Payment', icon: CreditCard },
    { label: 'Review', icon: Star },
    { label: 'Pricing', icon: Tag },
    { label: 'Call to Action', icon: Zap },
    { label: 'Survey', icon: MessageSquare },
    { label: 'Video', icon: Video },
    { label: 'Map', icon: Globe },
    { label: 'Calendar', icon: Layout },
    { label: 'Dashboard', icon: BarChart },
    { label: 'Table', icon: TableIcon },
    { label: 'Comments', icon: MessageSquare },
    { label: 'Download', icon: Download },
    { label: 'Sign In', icon: LogIn },
    { label: 'Register', icon: UserPlus },
    { label: '404', icon: AlertCircle },
    { label: 'Error Page', icon: AlertCircle },
    { label: 'User', icon: User },
    { label: 'Thank You', icon: CheckCircle },
    { label: 'Form', icon: FileText },
    { label: 'Upload Image', icon: ImageIcon, variant: 'image' },
    { label: 'YouTube Video', icon: YoutubeIcon, variant: 'video' },
    { label: 'Upload Video', icon: Video, variant: 'video_upload' },
    { label: 'Notepad', icon: Notebook, variant: 'notepad' },
  ],


  shape: [
    { label: 'Circle', icon: CircleIcon, shape: 'circle' },
    { label: 'Diamond', icon: Diamond, shape: 'diamond' },
    { label: 'Rectangle', icon: Square, shape: 'rectangle' },
    { label: 'Triangle', icon: TriangleIcon, shape: 'triangle' },
    { label: 'Round Rectangle', icon: Square, shape: 'round-rectangle' },
  ],
  social: [
    { label: 'Facebook', icon: Facebook },
    { label: 'Gmail', icon: MailIcon },
    { label: 'Instagram', icon: Instagram },
    { label: 'Discord', icon: MessageSquare },
    { label: 'LinkedIn', icon: Linkedin },
    { label: 'Flickr', icon: ImageIcon },
    { label: 'Pinterest', icon: ImageIcon },
    { label: 'Twitch', icon: YoutubeIcon },
    { label: 'Skype', icon: MessageSquare },
    { label: 'Github', icon: GithubIcon },
    { label: 'Medium', icon: FileText },
    { label: 'Threads', icon: MessageSquare },
    { label: 'Tik Tok', icon: YoutubeIcon },
    { label: 'Telegram', icon: MessageSquare },
    { label: 'Quora', icon: MessageSquare },
    { label: 'Etsy', icon: ShoppingBag },
    { label: 'Whatsup', icon: MessageSquare },
    { label: 'Reddit', icon: MessageSquare },
    { label: 'X', icon: Twitter },
    { label: 'Youtube', icon: YoutubeIcon },
    { label: 'Vimeo', icon: YoutubeIcon },
    { label: 'Slack', icon: SlackIcon },
    { label: 'Snapchat', icon: MessageSquare },
  ],
};

function FlowEditor({ project, onBack, onSave }: { project: Project, onBack: () => void, onSave: (id: string, name: string, nodes: any[], edges: any[]) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [projectName, setProjectName] = useState(project.name);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [complexity, setComplexity] = useState("Standard");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'wireframe' | 'shape' | 'social'>('wireframe');
  const [searchQuery, setSearchQuery] = useState("");
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, getZoom } = useReactFlow();
  const [zoomLevel, setZoomLevel] = useState(100);

  // Ã˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â« Ã™â€ Ã˜Â³Ã˜Â¨Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ™Æ’Ã˜Â¨Ã™Å Ã˜Â± Ã˜Â¹Ã™â€ Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜ÂºÃ™Å Ã™Å Ã˜Â±
  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
    setTimeout(() => setZoomLevel(Math.round(getZoom() * 100)), 220);
  };
  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
    setTimeout(() => setZoomLevel(Math.round(getZoom() * 100)), 220);
  };

  // Load project data on mount or when project changes
  React.useEffect(() => {
    if (project.data) {
      const restoredNodes = (project.data.nodes || []).map((node: any) => ({
        ...node,
        data: {
          ...node.data,
          icon: findIcon(node.data.label)
        }
      }));
      setNodes(restoredNodes);
      setEdges(project.data.edges || []);
      setProjectName(project.name);
    }
    setHasLoaded(true);
  }, [project.id, setNodes, setEdges]);

  // Auto-save project to parent state on change
  React.useEffect(() => {
    if (hasLoaded) {
      onSave(project.id, projectName, nodes, edges);
    }
  }, [nodes, edges, projectName, hasLoaded]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const itemData = JSON.parse(event.dataTransfer.getData('application/reactflow/data'));

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Find the original item to get the icon component (which can't be stringified)
      const variant = itemData.variant || activeTab;
      const originalItem = LIBRARY_ITEMS[activeTab]?.find(i => i.label === itemData.label);


      const newNode = {
        id: `${Date.now()}`,
        type: 'default',
        position,
        data: {
          label: itemData.label,
          variant: variant,
          icon: originalItem?.icon || itemData.icon,
          shape: originalItem?.shape || itemData.shape
        },
        style: variant === 'shape' ? { width: 120, height: 120 } : (variant === 'image' || variant === 'video' || activeTab === 'wireframe') ? { width: 140, height: 175 } : undefined



      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, activeTab, setNodes]
  );

  React.useEffect(() => {
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

  // Ã™â€¦Ã™â€ Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â¨Ã˜Â· Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂªÃ™Æ’Ã˜Â±Ã˜Â± Ã˜Â¹Ã™â€žÃ™â€° Ã™â€ Ã™ÂÃ˜Â³ Ã˜Â§Ã™â€žÃ™â€ Ã™â€šÃ˜Â·Ã˜Â© (Ã˜ÂªÃ™â€¦ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¹Ã˜Â¯Ã™Å Ã™â€ž Ã™â€žÃ™Å Ã˜Â³Ã™â€¦Ã˜Â­ Ã˜Â¨Ã˜Â±Ã˜Â¨Ã˜Â· Ã™â€¦Ã˜ÂªÃ˜Â¹Ã˜Â¯Ã˜Â¯)
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      // Ã™â€žÃ˜Â§ Ã™Å Ã™â€¦Ã™Æ’Ã™â€  Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â¨Ã˜Â· Ã™â€¦Ã™â€ /Ã˜Â¥Ã™â€žÃ™â€° Ã™â€ Ã™ÂÃ˜Â³ Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€šÃ˜Â¯Ã˜Â©
      if (source === target) return false;
      
      // Ã˜ÂªÃ™â€¦ Ã˜Â¥Ã˜Â²Ã˜Â§Ã™â€žÃ˜Â© Ã™â€šÃ™Å Ã™Ë†Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â¨Ã˜Â·Ã˜Å’ Ã˜Â§Ã™â€žÃ˜Â¢Ã™â€  Ã™Å Ã™â€¦Ã™Æ’Ã™â€  Ã˜Â±Ã˜Â¨Ã˜Â· Ã˜Â¹Ã˜Â¯Ã˜Â¯ Ã™â€žÃ˜Â§ Ã™â€ Ã™â€¡Ã˜Â§Ã˜Â¦Ã™Å  Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â·Ã™Ë†Ã˜Â· Ã™ÂÃ™Å  Ã™â€ Ã™ÂÃ˜Â³ Ã˜Â§Ã™â€žÃ™â€ Ã™â€šÃ˜Â·Ã˜Â©
      return true;
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6,4' },
      type: 'default',
      deletable: true,
    } as any, eds)),
    [setEdges],
  );

  // Ã˜Â­Ã˜Â°Ã™Â Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â· Ã˜Â¹Ã™â€ Ã˜Â¯ Ã˜Â§Ã™â€žÃ™â€ Ã™â€šÃ˜Â± Ã˜Â¹Ã™â€žÃ™Å Ã™â€¡
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, [setEdges]);

  const defaultEdgeOptions = {
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6,4' },
    type: 'default'
  };

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
    if (isLibraryOpen) setIsLibraryOpen(false);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    if (isLibraryOpen) setIsLibraryOpen(false);
  };

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...newData } } : node));
  };

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: { ...node.data, imageUrl },
                style: { ...node.style, width: img.width, height: img.height + 20 }
              };
            }
            return node;
          }));
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
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: { 
            ...node.data, 
            videoUrl: url, 
            imageUrl: thumbnailUrl || node.data.imageUrl 
          }
        };
      }
      return node;
    }));
  };

  const deleteNode = (id: string) => {


    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNode(null);
  };

  const addNodeFromLibrary = (item: any) => {
    const id = `${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'default',
      position: { x: Math.random() * 200 + 200, y: Math.random() * 200 + 200 },
      data: {
        label: item.label,
        variant: item.variant || activeTab,
        shape: item.shape,
        icon: item.icon
      },
      style: activeTab === 'shape' ? { width: 120, height: 120 } : (item.variant === 'image' || item.variant === 'video' || activeTab === 'wireframe') ? { width: 140, height: 175 } : undefined



    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addTextNode = () => {
    const id = `${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'default',
      position: { x: Math.random() * 200 + 200, y: Math.random() * 200 + 200 },
      data: {
        label: 'Annotation',
        variant: 'text',
      },
      style: { width: 150, height: 100 }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateFlow(prompt, complexity);
      const newNodes: Node[] = data.nodes.map((n: any) => ({
        id: n.id,
        type: 'default',
        position: { x: n.x, y: n.y },
        data: { label: n.label, color: n.color || '#3b82f6' }
      }));
      const newEdges: Edge[] = data.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6,4' },
        type: 'default'
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

  const filteredItems = LIBRARY_ITEMS[activeTab].filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
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

      <div className="flex-1 relative flex" ref={reactFlowWrapper}>
        <AnimatePresence>
          {isLibraryOpen && (
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-[80px] top-4 bottom-20 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  {['wireframe', 'shape', 'social'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-md transition-all capitalize",
                        activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">Tap on a node or drag and drop it to add to the flow</div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3 pb-8">
                  {filteredItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => addNodeFromLibrary(item)}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow/type', 'default');
                        event.dataTransfer.setData('application/reactflow/data', JSON.stringify({
                          label: item.label,
                          variant: item.variant || activeTab,

                          shape: item.shape,
                          icon: item.icon
                        }));
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group border border-transparent hover:border-blue-100 cursor-grab active:cursor-grabbing"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <item.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 text-center">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
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

          <AnimatePresence mode="wait">
            {selectedNode && (() => {
              // Always read live data from nodes array to avoid stale closure bug
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
                  <div className="flex flex-col gap-4 flex-1">
                    {liveNode.data.variant === 'text' ? (
                      <div className="space-y-1.5">
                        <label className="text-gray-900 font-medium text-sm">Annotation</label>
                        <textarea
                          value={liveNode.data.label as string}
                          onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-gray-900 font-medium text-sm">Label</label>
                            {(liveNode.data.variant === 'image' || liveNode.data.label === 'Upload Image' || liveNode.data.variant === 'video' || liveNode.data.label === 'YouTube Video' || liveNode.data.variant === 'video_upload' || liveNode.data.label === 'Upload Video') && (
                              <div className="relative">
                                {liveNode.data.variant === 'video' || liveNode.data.label === 'YouTube Video' ? (
                                  <div className="flex flex-col gap-1 w-full mt-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">YouTube Link</label>
                                    <input
                                      type="text"
                                      placeholder="Paste YouTube URL..."
                                      value={liveNode.data.videoUrl || ''}
                                      onChange={(e) => handleYoutubeUrlChange(selectedNode.id, e.target.value)}
                                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-[11px] font-medium"
                                    />
                                  </div>
                                ) : liveNode.data.variant === 'video_upload' || liveNode.data.label === 'Upload Video' ? (
                                  <>
                                    <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                                      <Video className="w-3 h-3" /> Upload Video
                                    </button>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      onChange={(e) => handleVideoUpload(selectedNode.id, e)}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                                      <ImageIcon className="w-3 h-3" /> Upload Image
                                    </button>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(selectedNode.id, e)}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <textarea
                            value={liveNode.data.label as string}
                            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-gray-900 font-medium text-sm">Label Details (No Limit)</label>
                          <textarea
                            value={liveNode.data.subLabel as string || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { subLabel: e.target.value })}
                            rows={4}
                            placeholder="Write additional text to show in the label..."
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-gray-900 font-medium text-sm">Url</label>
                          <input
                            type="text"
                            value={liveNode.data.url as string || ''}
                            placeholder=""
                            onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                          />
                          <p className="text-[10px] text-gray-500">Full URL (e.g. https://example.com)</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-gray-900 font-medium text-sm">Color</label>
                          <div className="flex flex-wrap gap-2">
                            {['#94a3b8', '#f97316', '#ff5c5c', '#00d284', '#00d64d', '#00c2ff', '#4f86f7', '#8e7dff'].map((color) => (
                              <div
                                key={color}
                                className={cn(
                                  "p-0.5 rounded-lg transition-all border",
                                  liveNode.data.color === color ? "border-gray-300 ring-2 ring-gray-50 bg-white" : "border-transparent"
                                )}
                              >
                                <button
                                  onClick={() => updateNodeData(selectedNode.id, { color })}
                                  className="w-7 h-7 rounded-[6px] transition-all block"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-start">
                    <button
                      onClick={() => deleteNode(selectedNode.id)}
                      className="w-9 h-9 flex items-center justify-center text-gray-400 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-all shadow-sm"
                      title="Delete node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </Panel>
              );
            })()}
          </AnimatePresence>

          <Panel position="bottom-left" className="ml-4 mb-4 flex items-center gap-2">
            <div className="flex items-center bg-white rounded-xl shadow-xl border border-gray-100 p-1">
              <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-lg"><LayoutGrid className="w-5 h-5" /></button>
              <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-lg"><LinkIcon className="w-5 h-5" /></button>
              <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-lg"><Maximize className="w-5 h-5" /></button>
              <div className="h-6 w-[1px] bg-gray-100 mx-1" />
              <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm"><Filter className="w-4 h-4" /> Funnel</button>
            </div>
          </Panel>

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

          <Panel position="bottom-center" className="mb-8 w-full max-w-2xl px-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 flex flex-col gap-3">
              <div className="flex items-center gap-3 px-4 pt-2">
                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Describe your flow idea for AI to generate"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 text-base"
                />
              </div>
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 ml-2">Complexity:</span>
                  {['Basic', 'Standard', 'Complex'].map((c) => (
                    <button key={c} onClick={() => setComplexity(c)} className={cn("px-3 py-1 text-xs font-semibold rounded-full transition-all", complexity === c ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-gray-500 hover:bg-gray-50")}>{c}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Palette className="w-5 h-5" /></button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg", isGenerating || !prompt.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200")}
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            </motion.div>
          </Panel>
        </ReactFlow>
      </div>

    </div>
  );
}

// Strip non-serializable fields (React component refs like `icon`) before saving
const serializeNodes = (nodes: any[]) =>
  nodes.map(({ data, ...rest }) => ({
    ...rest,
    data: {
      label:    data.label,
      subLabel: data.subLabel,
      variant:  data.variant,
      color:    data.color,
      url:      data.url,
      shape:    data.shape,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      // `icon` intentionally omitted Ã¢â‚¬â€ restored on load via findIcon(label)
    }
  }));

const serializeEdges = (edges: any[]) =>
  edges.map(({ data, ...rest }) => ({ ...rest, data: data ?? {} }));

function DesktopOnly() {
  const [view, setView] = useState<'workspace' | 'editor'>('workspace');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects from backend API
  React.useEffect(() => {
    if (!apiAuth.isLoggedIn()) {
      // If not logged in, fallback to localforage (optional) or show empty
      setIsLoading(false);
      return;
    }
    apiProjects.list()
      .then((data) => {
        setProjects(data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load projects', e);
        setIsLoading(false);
      });
  }, []);

  const persistProjects = (_: any) => {
    // No-op: persistence handled via API calls in create/save/delete
  };

  const handleCreateProject = async () => {
    if (!apiAuth.isLoggedIn()) {
      alert('Please log in to create a project');
      return;
    }
    const name = `Flow ${projects.length + 1}`;
    try {
      const res = await apiProjects.create(name);
      const newProject: Project = {
        id: String(res.id ?? Date.now()),
        name: res.name ?? name,
        lastModified: Date.now(),
        data: { nodes: [], edges: [] }
      };
      const updated = [newProject, ...projects];
      setProjects(updated);
      setCurrentProjectId(newProject.id);
      setView('editor');
    } catch (e) {
      console.error('Failed to create project', e);
    }
  };

  const handleOpenProject = async (id: string) => {
    if (!apiAuth.isLoggedIn()) {
+      // Optionally fetch public project data if needed; for now just open
+    }
+    try {
+      const full = await apiProjects.get(Number(id));
+      // full contains nodes, edges, etc.
+      setProjects(prev => {
+        const updated = prev.map(p => p.id === id ? { ...p, name: full.name, lastModified: full.lastModified, data: { nodes: full.nodes ?? [], edges: full.edges ?? [] } } : p);
+        return updated;
+      });
+    } catch (e) {
+      console.error('Failed to load project details', e);
+    }
+    setCurrentProjectId(id);
+    setView('editor');
+  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!apiAuth.isLoggedIn()) {
      alert('Please log in to delete a project');
      return;
    }
    if (window.confirm('Are you sure you want to delete this flow?')) {
      try {
        await apiProjects.delete(Number(id));
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        // No need to persist locally
      } catch (e) {
        console.error('Failed to delete project', e);
      }
    }
  };

  const handleSaveProject = async (id: string, name: string, nodes: any[], edges: any[]) => {
    try {
      await apiProjects.save(Number(id), name, nodes, edges);
      setProjects(prev => {
        const updated = prev.map(p => p.id === id ? { ...p, name, lastModified: Date.now(), data: { nodes, edges } } : p);
        return updated;
      });
    } catch (e) {
      console.error('Failed to save project', e);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading workspace...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {view === 'workspace' ? (
        <Workspace 
          projects={projects}
          onOpenProject={handleOpenProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <ReactFlowProvider>
          <FlowEditor 
            project={projects.find(p => p.id === currentProjectId)!}
            onBack={() => setView('workspace')}
            onSave={handleSaveProject}
          />
        </ReactFlowProvider>
      )}
    </div>
  );
}

export default function App() {
  return <DesktopOnly />;
}


