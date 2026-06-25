// =============================================
// CustomNode — مكون العقدة المخصص
// =============================================

import React from 'react';
import { cn } from '../../lib/utils';
import {
  Handle,
  Position,
  NodeResizer,
} from '@xyflow/react';
import {
  Globe,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Video,
  Notebook,
} from 'lucide-react';

// -----------------------------------------------
// Shared Handles Component (to avoid repetition)
// -----------------------------------------------
function NodeHandles() {
  return (
    <>
      <Handle id="top-s" type="source" position={Position.Top} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ top: '-4px', left: '50%' }} />
      <Handle id="top-t" type="target" position={Position.Top} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ top: '-4px', left: '50%' }} />
      <Handle id="bottom-s" type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ bottom: '-4px', left: '50%' }} />
      <Handle id="bottom-t" type="target" position={Position.Bottom} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ bottom: '-4px', left: '50%' }} />
      <Handle id="left-s" type="source" position={Position.Left} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ left: '-4px', top: '50%' }} />
      <Handle id="left-t" type="target" position={Position.Left} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ left: '-4px', top: '50%' }} />
      <Handle id="right-s" type="source" position={Position.Right} className="!w-2 !h-2 !bg-[#313131] !border-none !z-[100] !opacity-100 !rounded-full" style={{ right: '-4px', top: '50%' }} />
      <Handle id="right-t" type="target" position={Position.Right} className="!w-2 !h-2 !bg-transparent !border-none !z-[99] !opacity-0" style={{ right: '-4px', top: '50%' }} />
    </>
  );
}

// -----------------------------------------------
// URL Badge Component
// -----------------------------------------------
function UrlBadge({ url }: { url: string }) {
  return (
    <div className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm whitespace-nowrap">
        <span className="text-xs text-gray-700 font-medium">
          {url.length > 25 ? url.substring(0, 25) + '...' : url}
        </span>
      </div>
    </div>
  );
}

// -----------------------------------------------
// Shape Variant
// -----------------------------------------------
function ShapeNode({ data, selected }: { data: any; selected: boolean }) {
  const shapeContent = (
    <div className="absolute inset-0 flex flex-col items-center justify-start p-1 pt-2 text-center">
      <div className="w-4/5 h-1.5 bg-gray-400/30 rounded-full mb-2" />
      <div className="flex-1 flex items-center justify-center w-full px-2">
        <div className="font-bold text-sm text-gray-900 break-words leading-tight">{data.label}</div>
      </div>
    </div>
  );

  const renderShape = () => {
    switch (data.shape) {
      case 'circle':
        return (
          <div className="relative w-full h-full rounded-full border-2 bg-white shadow-sm overflow-hidden" style={{ borderColor: data.color || '#94a3b8' }}>
            {shapeContent}
          </div>
        );
      case 'diamond':
        return (
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
      case 'triangle':
        return (
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
      case 'round-rectangle':
        return (
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
      default:
        return (
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
      <NodeHandles />
      <div className="w-full h-full min-w-[80px] min-h-[80px]">
        {renderShape()}
      </div>
      {data.url && <UrlBadge url={data.url} />}
    </div>
  );
}

// -----------------------------------------------
// Social Variant
// -----------------------------------------------
function SocialNode({ data, selected }: { data: any; selected: boolean }) {
  const Icon = data.icon || Globe;
  return (
    <div className={cn("relative transition-all rounded-xl p-1 w-full h-full flex items-center justify-center", selected ? "shadow-[0_0_0_6px_#e9ebef]" : "")}>
      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-48 text-center z-10 pointer-events-none">
        <div className="font-bold text-2xl text-gray-900">{data.label}</div>
      </div>
      <NodeHandles />
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

// -----------------------------------------------
// Text Variant
// -----------------------------------------------
function TextNode({ data, selected }: { data: any; selected: boolean }) {
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

// -----------------------------------------------
// Default (Wireframe) Node Content
// -----------------------------------------------
function WireframeContent({ data }: { data: any }) {
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
        <img
          src={`https://api.microlink.io/?url=${encodeURIComponent(websiteUrl)}&screenshot=true&embed=screenshot.url`}
          className="w-full h-full object-cover object-top"
          alt="Website Thumbnail"
          onError={(e) => {
            if ((e.currentTarget as HTMLImageElement).src.includes('microlink.io')) {
              (e.currentTarget as HTMLImageElement).src = `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(websiteUrl)}?w=400`;
            } else if ((e.currentTarget as HTMLImageElement).src.includes('wordpress.com')) {
              (e.currentTarget as HTMLImageElement).src = `https://mini.s-shot.ru/1024x768/JPEG/400/Z100/?${websiteUrl}`;
            } else {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }
          }}
        />
        <div className="absolute inset-0 border border-black/5 pointer-events-none" />
      </div>
    );
  }

  // Default wireframe placeholder
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
}

// -----------------------------------------------
// Main CustomNode Component
// -----------------------------------------------
const CustomNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  if (data.variant === 'shape') {
    return <ShapeNode data={data} selected={selected} />;
  }

  if (data.variant === 'social') {
    return <SocialNode data={data} selected={selected} />;
  }

  if (data.variant === 'text') {
    return <TextNode data={data} selected={selected} />;
  }

  // Default: wireframe node
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
      <NodeHandles />

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
          <WireframeContent data={data} />
        </div>
      </div>

      {data.url && <UrlBadge url={data.url} />}
    </div>
  );
};

export default CustomNode;

export const nodeTypes = {
  default: CustomNode,
  input: CustomNode,
  output: CustomNode,
};
