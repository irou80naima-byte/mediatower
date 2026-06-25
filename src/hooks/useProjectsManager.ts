// =============================================
// useProjectsManager — إدارة CRUD للمشاريع
// =============================================

import { useState, useCallback } from 'react';
import { projects as apiProjects } from '../services/apiClient';
import type { Project } from '../types/project';

interface UseProjectsManagerReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  loadProjects: () => Promise<void>;
  createProject: (name?: string) => Promise<Project>;
  openProject: (id: string) => Promise<Project>;
  saveProject: (id: string, name: string, nodes: any[], edges: any[]) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectInMemory: (id: string, updates: Partial<Project>) => void;
}

export function useProjectsManager(): UseProjectsManagerReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----- Load all projects (list only — no node data) -----
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiProjects.list();
      const normalized = (data || []).map((p: any) => ({
        ...p,
        id: String(p.id),
        data: null, // data not loaded in list view
      }));
      setProjects(normalized);
    } catch (e: any) {
      console.error('[ProjectsManager] Failed to load projects', e);
      setError(e.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ----- Create a new project -----
  const createProject = useCallback(async (name?: string) => {
    const projectName = name || `Flow ${projects.length + 1}`;
    try {
      const res = await apiProjects.create(projectName);
      const newProject: Project = {
        id: String(res.id ?? Date.now()),
        name: res.name ?? projectName,
        lastModified: Date.now(),
        data: { nodes: [], edges: [] },
      };
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (e: any) {
      console.error('[ProjectsManager] Failed to create project', e);
      throw e;
    }
  }, [projects.length]);

  // ----- Open a project (fetch full data) -----
  const openProject = useCallback(async (id: string) => {
    try {
      const full = await apiProjects.get(Number(id));
      const projectData = full.data ?? full;
      const project: Project = {
        id: String(id),
        name: full.name ?? '',
        lastModified: full.lastModified ?? Date.now(),
        data: {
          nodes: projectData.nodes ?? [],
          edges: projectData.edges ?? [],
        },
      };

      // Update the project in the list
      setProjects((prev) => {
        const exists = prev.some((p) => String(p.id) === String(id));
        if (exists) {
          return prev.map((p) => (String(p.id) === String(id) ? project : p));
        }
        return [project, ...prev];
      });

      return project;
    } catch (e: any) {
      console.error('[ProjectsManager] Failed to open project', e);
      throw e;
    }
  }, []);

  // ----- Save project data -----
  const saveProject = useCallback(async (
    id: string,
    name: string,
    nodes: any[],
    edges: any[]
  ) => {
    await apiProjects.save(Number(id), name, nodes, edges);
    // Update local state
    setProjects((prev) =>
      prev.map((p) =>
        String(p.id) === String(id)
          ? { ...p, name, lastModified: Date.now(), data: { nodes, edges } }
          : p
      )
    );
  }, []);

  // ----- Delete a project -----
  const deleteProject = useCallback(async (id: string) => {
    await apiProjects.delete(Number(id));
    setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }, []);

  // ----- Update project in memory (no API call) -----
  const updateProjectInMemory = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, ...updates } : p))
    );
  }, []);

  return {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    openProject,
    saveProject,
    deleteProject,
    updateProjectInMemory,
  };
}
