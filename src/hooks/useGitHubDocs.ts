
import { useState, useEffect, useCallback } from 'react';
import { GitHubDocsService, createGitHubService, GitHubConfig, DocContent } from '@/services/githubApi';

interface UseGitHubDocsReturn {
  service: GitHubDocsService | null;
  config: GitHubConfig | null;
  isConfigured: boolean;
  saveConfig: (config: GitHubConfig) => void;
  clearConfig: () => void;
  error: string | null;
}

export const useGitHubDocs = (): UseGitHubDocsReturn => {
  const [service, setService] = useState<GitHubDocsService | null>(null);
  const [config, setConfig] = useState<GitHubConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load config from localStorage on mount
    try {
      const savedConfig = localStorage.getItem('github-docs-config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setService(createGitHubService(parsedConfig));
      }
    } catch (err) {
      console.error('Error loading GitHub config:', err);
      setError('Failed to load GitHub configuration');
    }
  }, []);

  const saveConfig = useCallback((newConfig: GitHubConfig) => {
    try {
      localStorage.setItem('github-docs-config', JSON.stringify(newConfig));
      setConfig(newConfig);
      setService(createGitHubService(newConfig));
      setError(null);
    } catch (err) {
      console.error('Error saving GitHub config:', err);
      setError('Failed to save GitHub configuration');
    }
  }, []);

  const clearConfig = useCallback(() => {
    localStorage.removeItem('github-docs-config');
    setConfig(null);
    setService(null);
    setError(null);
  }, []);

  return {
    service,
    config,
    isConfigured: !!config && !!service,
    saveConfig,
    clearConfig,
    error
  };
};

export const useGitHubDocsList = () => {
  const { service } = useGitHubDocs();
  const [docs, setDocs] = useState<DocContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDocs = useCallback(async () => {
    if (!service) return;

    setLoading(true);
    setError(null);
    try {
      const allDocs = await service.getAllDocs();
      setDocs(allDocs);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching docs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Set up real-time listener
  useEffect(() => {
    if (!service) return;

    const handleUpdate = () => {
      console.log('Docs updated from GitHub, refreshing...');
      const cachedDocs = service.getCachedDocs();
      setDocs(cachedDocs);
      setLastUpdate(new Date());
    };

    service.addListener(handleUpdate);

    // Initial fetch
    fetchDocs();

    return () => {
      service.removeListener(handleUpdate);
    };
  }, [service, fetchDocs]);

  return {
    docs,
    loading,
    error,
    lastUpdate,
    refetch: fetchDocs
  };
};
