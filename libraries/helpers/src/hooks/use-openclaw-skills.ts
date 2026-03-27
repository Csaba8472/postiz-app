'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { useFetch } from '../utils/custom.fetch';

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface SkillResult {
  skillId: string;
  output: Record<string, any>;
  status: 'completed' | 'failed' | 'running';
}

export const useOpenClawSkills = () => {
  const fetch = useFetch();

  const load = useCallback(async () => {
    return (await (await fetch('/openclaw/skills')).json()) as Skill[];
  }, [fetch]);

  const { data, mutate, isLoading } = useSWR('openclaw/skills', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    fallbackData: [],
  });

  return {
    skills: data || [],
    isLoading,
    mutate,
  };
};

export const runOpenClawSkill = async (
  skillId: string,
  input: Record<string, any>,
): Promise<SkillResult> => {
  const fetch = useFetch();
  const response = await fetch('/openclaw/skills/run', {
    method: 'POST',
    body: JSON.stringify({ skillId, input }),
  });
  return (await response.json()) as SkillResult;
};
