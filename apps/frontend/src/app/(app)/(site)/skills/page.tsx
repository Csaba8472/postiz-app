'use client';

import {
  useOpenClawSkills,
  useOpenClawSkillRunner,
} from '@gitroom/helpers/hooks/use-openclaw-skills';
import { SkillsList } from '@gitroom/frontend/components/skills/skills-list.component';
import { SkillRunnerModal } from '@gitroom/frontend/components/skills/skill-runner-modal.component';
import { useState } from 'react';

export default function SkillsPage() {
  const { skills, isLoading } = useOpenClawSkills();
  const runSkill = useOpenClawSkillRunner();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSkill = async (skillId: string) => {
    setSelectedSkill(skillId);
    setIsRunning(true);
    setResults(null);

    try {
      const result = await runSkill(skillId, { organizationId: 'current' });
      setResults(result.output);
    } catch (error) {
      setResults({ error: (error as Error).message });
    } finally {
      setIsRunning(false);
    }
  };

  const closeModal = () => {
    setSelectedSkill(null);
    setResults(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
          🤖 Skills Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Run AI-powered marketing skills to optimize your content and workflow.
        </p>
      </div>

      <SkillsList
        skills={skills}
        isLoading={isLoading}
        onRunSkill={handleRunSkill}
      />

      {selectedSkill && (
        <SkillRunnerModal
          skillId={selectedSkill}
          skillName={
            skills.find((s) => s.id === selectedSkill)?.name || selectedSkill
          }
          isRunning={isRunning}
          results={results}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
