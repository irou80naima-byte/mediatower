// =============================================
// Mediatower PLAN — App Root
// =============================================
// This file was restructured from 1646 lines to ~350 lines.
// All flow editor logic has been moved to dedicated components and hooks.

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';

import type { Project } from './types/project';
import { useProjectsManager } from './hooks/useProjectsManager';
import { auth as apiAuth } from './services/apiClient';
import { projects as apiProjects } from './services/apiClient';
import Workspace from './components/Workspace';
import FlowEditor from './components/flow/FlowEditor';

// =============================================
// Auth Screen
// =============================================
function AuthScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await apiAuth.login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('الاسم مطلوب');
        }
        await apiAuth.register(name, email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'فشلت عملية المصادقة. يرجى التحقق من البيانات والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M6 21V9a9 9 0 0 0 9 9" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">Mediatower PLAN</h2>
          <p className="mt-2 text-sm text-gray-500">
            {isLogin ? 'تسجيل الدخول للوصول إلى مساحة العمل السحابية الخاصة بك' : 'إنشاء حساب جديد لحفظ وإدارة مشاريعك السحابية'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2 font-medium">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمد أحمد"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري التحميل...
              </span>
            ) : (
              isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
          >
            {isLogin ? "لا تملك حساباً؟ أنشئ حساباً الآن" : 'لديك حساب بالفعل؟ سجل الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// FlowEditorRoute — Wrapper for routing
// =============================================
function FlowEditorRoute({
  projects,
  onSave,
  onProjectLoaded,
  isWorkspaceLoading,
}: {
  projects: Project[];
  onSave: (id: string, name: string, nodes: any[], edges: any[]) => Promise<void>;
  onProjectLoaded: (id: string, name: string, nodes: any[], edges: any[]) => void;
  isWorkspaceLoading: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  const project = projects.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (isWorkspaceLoading) return;

    if (!project) {
      navigate('/');
      return;
    }

    if (!project.data && !isProjectLoading) {
      setIsProjectLoading(true);
      apiProjects
        .get(Number(id))
        .then((full) => {
          const projectData = full.data ?? full;
          onProjectLoaded(
            String(id),
            full.name ?? project.name,
            projectData.nodes ?? [],
            projectData.edges ?? []
          );
          setIsProjectLoading(false);
        })
        .catch((err) => {
          console.error('Error loading project details', err);
          setIsProjectLoading(false);
          navigate('/');
        });
    }
  }, [id, project, isProjectLoading, onProjectLoaded, navigate, isWorkspaceLoading]);

  if (isWorkspaceLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading workspace...</div>;
  }

  if (!project || isProjectLoading || !project.data) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading flow data...</div>;
  }

  return (
    <ReactFlowProvider>
      <FlowEditor
        project={project}
        onBack={() => navigate('/')}
        onSave={onSave}
      />
    </ReactFlowProvider>
  );
}

// =============================================
// DesktopOnly — Main App Shell
// =============================================
function DesktopOnly() {
  const {
    projects,
    isLoading,
    loadProjects,
    createProject,
    openProject,
    saveProject,
    deleteProject,
    updateProjectInMemory,
  } = useProjectsManager();

  const [isLoggedIn, setIsLoggedIn] = useState(apiAuth.isLoggedIn());
  const navigate = useNavigate();

  // Load projects on login
  useEffect(() => {
    if (isLoggedIn) {
      loadProjects();
    }
  }, [isLoggedIn, loadProjects]);

  const handleCreateProject = async () => {
    if (!isLoggedIn) {
      alert('Please log in to create a project');
      return;
    }
    try {
      const newProject = await createProject();
      navigate(`/flow/${newProject.id}`);
    } catch (e: any) {
      console.error('Failed to create project', e);
      alert(`فشل إنشاء الفلو: ${e?.message || 'تحقق من اتصال السيرفر وقاعدة البيانات.'}`);
    }
  };

  const handleOpenProject = async (id: string) => {
    try {
      await openProject(id);
    } catch (e) {
      console.error('Failed to load project details', e);
    }
    navigate(`/flow/${id}`);
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('Please log in to delete a project');
      return;
    }
    if (window.confirm('Are you sure you want to delete this flow?')) {
      try {
        await deleteProject(id);
      } catch (e) {
        console.error('Failed to delete project', e);
      }
    }
  };

  const handleSaveProject = async (id: string, name: string, nodes: any[], edges: any[]) => {
    await saveProject(id, name, nodes, edges);
  };

  const handleLogout = async () => {
    if (window.confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟')) {
      try {
        await apiAuth.logout();
      } catch (e) {
        console.error('Logout error', e);
      }
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const handleProjectLoaded = (id: string, name: string, nodes: any[], edges: any[]) => {
    updateProjectInMemory(id, { name, data: { nodes, edges } });
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading workspace...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <Workspace
              projects={projects}
              onOpenProject={handleOpenProject}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/flow/:id"
          element={
            <FlowEditorRoute
              projects={projects}
              onSave={handleSaveProject}
              onProjectLoaded={handleProjectLoaded}
              isWorkspaceLoading={isLoading}
            />
          }
        />
      </Routes>
    </div>
  );
}

// =============================================
// App Root
// =============================================
export default function App() {
  return (
    <BrowserRouter>
      <DesktopOnly />
    </BrowserRouter>
  );
}
