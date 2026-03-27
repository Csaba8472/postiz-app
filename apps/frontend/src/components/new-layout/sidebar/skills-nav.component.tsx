'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SkillsNavComponent = () => {
  const pathname = usePathname();
  const isActive = pathname === '/skills';

  return (
    <Link
      href="/skills"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '8px',
        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        background: isActive ? 'var(--bg-secondary)' : 'transparent',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: '18px' }}>🤖</span>
      Skills
    </Link>
  );
};
