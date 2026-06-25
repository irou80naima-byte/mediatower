// =============================================
// LibraryPanel — مكتبة العناصر (wireframe, shapes, social)
// =============================================

import React from 'react';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { LIBRARY_ITEMS } from '../../constants/libraryItems';
import type { LibraryCategory, LibraryItem } from '../../types/project';

interface LibraryPanelProps {
  activeTab: LibraryCategory;
  onTabChange: (tab: LibraryCategory) => void;
  onAddNode: (item: LibraryItem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({
  activeTab,
  onTabChange,
  onAddNode,
  searchQuery,
  onSearchChange,
}) => {
  const filteredItems = LIBRARY_ITEMS[activeTab].filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex p-1 bg-gray-100 rounded-lg">
          {(['wireframe', 'shape', 'social'] as LibraryCategory[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-md transition-all capitalize",
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">
          Tap on a node or drag and drop it to add to the flow
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 pb-8">
          {filteredItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onAddNode(item)}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow/type', 'default');
                event.dataTransfer.setData(
                  'application/reactflow/data',
                  JSON.stringify({
                    label: item.label,
                    variant: item.variant || activeTab,
                    shape: item.shape,
                  })
                );
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
  );
};

export default LibraryPanel;
