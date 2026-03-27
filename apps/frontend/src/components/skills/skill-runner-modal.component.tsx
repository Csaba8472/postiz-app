'use client';

interface SkillRunnerModalProps {
  skillId: string;
  skillName: string;
  isRunning: boolean;
  results: any;
  onClose: () => void;
}

export const SkillRunnerModal = ({
  skillId,
  skillName,
  isRunning,
  results,
  onClose,
}: SkillRunnerModalProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '24px',
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>
            Running: {skillName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            ×
          </button>
        </div>

        {isRunning && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <p>Running skill...</p>
          </div>
        )}

        {results && !isRunning && (
          <div>
            {results.error ? (
              <div
                style={{
                  color: 'red',
                  padding: '16px',
                  background: 'rgba(255,0,0,0.1)',
                  borderRadius: '8px',
                }}
              >
                Error: {results.error}
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '16px',
                  borderRadius: '8px',
                }}
              >
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
