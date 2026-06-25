// =============================================
// FlowToolbar — شريط أدوات الـ Flow Editor
// =============================================

import React from 'react';
import { cn } from '../../lib/utils';
import {
  Sparkles,
  Palette,
} from 'lucide-react';
import { motion } from 'motion/react';

interface FlowToolbarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  complexity: string;
  onComplexityChange: (value: string) => void;
}

const FlowToolbar: React.FC<FlowToolbarProps> = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  complexity,
  onComplexityChange,
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 flex flex-col gap-3"
    >
      <div className="flex items-center gap-3 px-4 pt-2">
        <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          placeholder="Describe your flow idea for AI to generate"
          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 text-base"
        />
      </div>
      <div className="flex items-center justify-between px-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 ml-2">Complexity:</span>
          {['Basic', 'Standard', 'Complex'].map((c) => (
            <button
              key={c}
              onClick={() => onComplexityChange(c)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full transition-all",
                complexity === c
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
            <Palette className="w-5 h-5" />
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg",
              isGenerating || !prompt.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200"
            )}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FlowToolbar;
