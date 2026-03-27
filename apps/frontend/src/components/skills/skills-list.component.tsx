'use client';

import { Skill } from '@gitroom/helpers/hooks/use-openclaw-skills';

interface SkillsListProps {
  skills: Skill[];
  isLoading: boolean;
  onRunSkill: (skillId: string) => void;
}

export const SkillsList = ({
  skills,
  isLoading,
  onRunSkill,
}: SkillsListProps) => {
  if (isLoading) {
    return <div>Loading skills...</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {skills.map((skill) => (
        <div
          key={skill.id}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{skill.icon || '🤖'}</span>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{skill.name}</h3>
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}
          >
            {skill.description}
          </p>
          <button
            onClick={() => onRunSkill(skill.id)}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Run Skill
          </button>
        </div>
      ))}
    </div>
  );
};
