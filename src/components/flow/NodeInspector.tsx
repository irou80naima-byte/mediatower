// =============================================
// NodeInspector — لوحة تحرير العقدة المحددة
// =============================================

import React from 'react';
import { cn } from '../../lib/utils';
import type { Node } from '@xyflow/react';
import {
  Trash2,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { getYoutubeThumbnail } from '../../constants/libraryItems';

interface NodeInspectorProps {
  selectedNode: Node;
  liveNode: Node;
  onUpdateNodeData: (id: string, newData: any) => void;
  onDeleteNode: (id: string) => void;
  onImageUpload: (id: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoUpload: (id: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onYoutubeUrlChange: (id: string, url: string) => void;
}

const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  liveNode,
  onUpdateNodeData,
  onDeleteNode,
  onImageUpload,
  onVideoUpload,
  onYoutubeUrlChange,
}) => {
  const isMediaNode =
    liveNode.data.variant === 'image' ||
    liveNode.data.label === 'Upload Image' ||
    liveNode.data.variant === 'video' ||
    liveNode.data.label === 'YouTube Video' ||
    liveNode.data.variant === 'video_upload' ||
    liveNode.data.label === 'Upload Video';

  const isYoutube =
    liveNode.data.variant === 'video' || liveNode.data.label === 'YouTube Video';

  const isVideoUpload =
    liveNode.data.variant === 'video_upload' || liveNode.data.label === 'Upload Video';

  return (
    <div className="flex flex-col gap-4 flex-1">
      {liveNode.data.variant === 'text' ? (
        <div className="space-y-1.5">
          <label className="text-gray-900 font-medium text-sm">Annotation</label>
          <textarea
            value={liveNode.data.label as string}
            onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
          />
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-gray-900 font-medium text-sm">Label</label>
              {isMediaNode && (
                <div className="relative">
                  {isYoutube ? (
                    <div className="flex flex-col gap-1 w-full mt-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">YouTube Link</label>
                      <input
                        type="text"
                        placeholder="Paste YouTube URL..."
                        value={(liveNode.data.videoUrl as string) || ''}
                        onChange={(e) => onYoutubeUrlChange(selectedNode.id, e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-[11px] font-medium"
                      />
                    </div>
                  ) : isVideoUpload ? (
                    <>
                      <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                        <Video className="w-3 h-3" /> Upload Video
                      </button>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => onVideoUpload(selectedNode.id, e)}
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
                        onChange={(e) => onImageUpload(selectedNode.id, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
            <textarea
              value={liveNode.data.label as string}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-900 font-medium text-sm">Label Details (No Limit)</label>
            <textarea
              value={(liveNode.data.subLabel as string) || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { subLabel: e.target.value })}
              rows={4}
              placeholder="Write additional text to show in the label..."
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-900 font-medium text-sm">Url</label>
            <input
              type="text"
              value={(liveNode.data.url as string) || ''}
              placeholder=""
              onChange={(e) => onUpdateNodeData(selectedNode.id, { url: e.target.value })}
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
                    onClick={() => onUpdateNodeData(selectedNode.id, { color })}
                    className="w-7 h-7 rounded-[6px] transition-all block"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="pt-6 border-t border-gray-100 flex justify-start">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-9 h-9 flex items-center justify-center text-gray-400 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-all shadow-sm"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NodeInspector;
