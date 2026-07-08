import React from 'react';
import { cn } from '../lib/utils';
import { LOGO_SRC } from '../assets/logo';

interface Project {
  id: string;
  name: string;
  lastModified: number;
  data: any;
}

interface WorkspaceProps {
  projects: Project[];
  onOpenProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onLogout?: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ projects, onOpenProject, onCreateProject, onDeleteProject, onLogout }) => {
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-60 bg-gray-50 border-r inherited-css z-10">
        <nav className="flex h-full min-h-0 flex-col overflow-y-auto">
          <div className="p-6 pb-2">
            <a href="#">
              <div className="flex items-center gap-2 text-gray-900">
                <img src={LOGO_SRC} alt="Plan+B" className="w-8 h-8 object-contain" />
                <div className="font-bold relative text-xl">
                  Plan+B
                  <div className="absolute ml-0.5 -top-px left-full text-xs font-medium text-blue-600">v1.2</div>
                </div>
              </div>
            </a>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-1 text-sm font-semibold">
            <div className="my-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Workspace</div>
            <a aria-current="page" className="bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-3 text-blue-600" href="#">
              <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 5.99519C2 5.44556 2.44556 5 2.99519 5H11.0048C11.5544 5 12 5.44556 12 5.99519C12 6.54482 11.5544 6.99039 11.0048 6.99039H2.99519C2.44556 6.99039 2 6.54482 2 5.99519Z" fill="currentColor" />
                <path d="M2 11.9998C2 11.4501 2.44556 11.0046 2.99519 11.0046H21.0048C21.5544 11.0046 22 11.4501 22 11.9998C22 12.5494 21.5544 12.9949 21.0048 12.9949H2.99519C2.44556 12.9949 2 12.5494 2 11.9998Z" fill="currentColor" />
                <path d="M2.99519 17.0096C2.44556 17.0096 2 17.4552 2 18.0048C2 18.5544 2.44556 19 2.99519 19H15.0048C15.5544 19 16 18.5544 16 18.0048C16 17.4552 15.5544 17.0096 15.0048 17.0096H2.99519Z" fill="currentColor" />
              </svg>
              Flows
            </a>
            <div>
              <div className="my-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Groups</div>
              <div className="flex items-center justify-between my-1">
                <a className="hover:bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-3 text-gray-600 w-full" href="#">
                  <div className="h-2.5 w-2.5 rounded-full bg-teal-400"></div>
                  Examples
                </a>
              </div>
              <button className="flex items-center gap-2 mt-3 bg-white px-3 py-2 rounded-lg border border-gray-200 w-full justify-center text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" /></svg>
                Add new group
              </button>
            </div>
          </div>
          <div className="px-6 mb-4">
            <a className="hover:bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-semibold text-gray-600" href="#">
              <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
              </svg>
              Documentation
            </a>
          </div>
          {onLogout && (
            <div className="px-6 mb-4">
              <button 
                onClick={onLogout}
                className="hover:bg-red-50 hover:text-red-600 px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-semibold text-gray-600 w-full text-left transition-colors"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
          )}
          <div className="p-6 border-t border-gray-100">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="space-y-1">
                <div className="font-bold text-gray-900 text-sm">Support</div>
                <div className="text-xs text-gray-500 leading-relaxed">We are here to help. Email us at <strong className="text-blue-600">support@email</strong> if you need any help.</div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-60 overflow-y-auto bg-white min-h-screen">
        <div className="p-12 mx-auto lg:max-w-7xl flex flex-col h-full inherited-css">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Flows</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new flow or modify your recent work.</p>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {/* Create New Button */}
            <button 
              onClick={onCreateProject}
              className="border-2 border-dashed border-gray-200 rounded-xl h-[180px] p-6 w-full flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" className="w-6 h-6 text-gray-400 group-hover:text-blue-600" xmlns="http://www.w3.org/2000/svg">
                  <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-600 group-hover:text-blue-600">Create new flow</div>
            </button>

            {/* Project Cards */}
            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <div 
                  onClick={() => onOpenProject(project.id)}
                  className="border border-gray-200 rounded-xl p-2 bg-white select-none hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer h-[180px] flex flex-col justify-between"
                >
                  <div className="w-full h-28 bg-gray-50 rounded-lg relative overflow-hidden flex items-center justify-center border border-gray-50 group-hover:bg-gray-100/50 transition-colors">
                    {/* Placeholder for flow preview */}
                    <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity scale-75">
                       <div className="w-16 h-1 bg-gray-400 rounded-full" />
                       <div className="w-12 h-1 bg-gray-400 rounded-full" />
                       <div className="w-20 h-1 bg-gray-400 rounded-full" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-lg">Open Flow</div>
                    </div>
                  </div>
                  <div className="px-2 pb-1">
                    <div className="text-[10px] text-gray-400 mt-2 font-medium">{formatTime(project.lastModified)}</div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-gray-900 truncate pr-4">{project.name}</div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => onDeleteProject(project.id, e)}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-gray-100 hover:border-red-100 shadow-sm"
                  title="Delete project"
                >
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workspace;
