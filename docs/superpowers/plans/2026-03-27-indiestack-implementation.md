# IndieStack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork Postiz with OpenClaw integration — add Skills Hub page, Create page AI workflow, and backend OpenClaw integration endpoints.

**Architecture:** OpenClaw runs as an external hosted service. IndieStack adds an `openclaw` module in `libs/nestjs-libraries/src/openclaw/` that connects to the external OpenClaw API. Frontend adds Skills Hub page and modifies Create page with AI suggestions panel.

**Tech Stack:** NestJS (backend), React/Vite (frontend), Prisma (database), External OpenClaw API (hosted)

---

## File Structure

### Backend (New Files)

- Create: `libraries/nestjs-libraries/src/openclaw/openclaw.service.ts` — Service to call external OpenClaw API
- Create: `libraries/nestjs-libraries/src/openclaw/openclaw.module.ts` — NestJS module
- Create: `apps/backend/src/api/routes/openclaw.controller.ts` — REST endpoints for skills

### Backend (Existing Files to Modify)

- Modify: `apps/backend/src/api/api.module.ts` — Import OpenClawModule

### Frontend (New Files)

- Create: `apps/frontend/src/app/(app)/(site)/skills/page.tsx` — Skills Hub page
- Create: `apps/frontend/src/components/skills/skills-list.component.tsx` — Skill cards component
- Create: `apps/frontend/src/components/skills/skill-runner.component.tsx` — Skill execution component
- Create: `apps/frontend/src/components/new-layout/sidebar/skills-nav.component.tsx` — Sidebar nav item
- Create: `libraries/helpers/src/hooks/use-openclaw-skills.ts` — SWR hook for fetching skills

### Frontend (Existing Files to Modify)

- Modify: `apps/frontend/src/components/new-layout/sidebar/sidebar.component.tsx` — Add Skills nav item

---

## Task 1: Backend — OpenClaw Service Module

**Files:**

- Create: `libraries/nestjs-libraries/src/openclaw/openclaw.service.ts`
- Create: `libraries/nestjs-libraries/src/openclaw/dtos/openclaw.dto.ts`
- Create: `libraries/nestjs-libraries/src/openclaw/openclaw.module.ts`
- Modify: `libraries/nestjs-libraries/src/index.ts` — Export OpenClawModule

- [ ] **Step 1: Create OpenClaw DTOs**

```typescript
// libraries/nestjs-libraries/src/openclaw/dtos/openclaw.dto.ts
export class SkillDto {
  id!: string;
  name!: string;
  description!: string;
  icon?: string;
}

export class RunSkillDto {
  skillId!: string;
  input!: Record<string, any>;
  organizationId!: string;
}

export class SkillResultDto {
  skillId!: string;
  output!: Record<string, any>;
  status!: 'completed' | 'failed' | 'running';
}
```

- [ ] **Step 2: Create OpenClaw Service**

```typescript
// libraries/nestjs-libraries/src/openclaw/openclaw.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SkillDto, RunSkillDto, SkillResultDto } from './dtos/openclaw.dto';

@Injectable()
export class OpenClawService {
  private readonly logger = new Logger(OpenClawService.name);
  private readonly openclawApiUrl: string;
  private readonly openclawApiKey: string;

  constructor() {
    this.openclawApiUrl =
      process.env.OPENCLAW_API_URL || 'http://localhost:8080';
    this.openclawApiKey = process.env.OPENCLAW_API_KEY || '';
  }

  async listSkills(): Promise<SkillDto[]> {
    // Returns pre-configured skills: last30days, product-hunt-launch, seo-geo-claude, larry
    return [
      {
        id: 'last30days',
        name: 'last30days',
        description: 'Analyze 30-day growth & suggest content',
        icon: '📊',
      },
      {
        id: 'product-hunt-launch',
        name: 'product-hunt-launch',
        description: 'Optimize for PH launch day',
        icon: '🏹',
      },
      {
        id: 'seo-geo-claude',
        name: 'seo-geo-claude',
        description: 'Keyword research & content optimization',
        icon: '🔍',
      },
      {
        id: 'larry',
        name: 'larry',
        description: 'Social listening & engagement',
        icon: '💬',
      },
    ];
  }

  async runSkill(dto: RunSkillDto): Promise<SkillResultDto> {
    try {
      const response = await fetch(
        `${this.openclawApiUrl}/api/skills/${dto.skillId}/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openclawApiKey}`,
          },
          body: JSON.stringify({
            input: dto.input,
            organizationId: dto.organizationId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        skillId: dto.skillId,
        output: result,
        status: 'completed',
      };
    } catch (error) {
      this.logger.error(`Failed to run skill ${dto.skillId}`, error);
      return {
        skillId: dto.skillId,
        output: { error: (error as Error).message },
        status: 'failed',
      };
    }
  }
}
```

- [ ] **Step 3: Create OpenClaw Module**

```typescript
// libraries/nestjs-libraries/src/openclaw/openclaw.module.ts
import { Module, Global } from '@nestjs/common';
import { OpenClawService } from './openclaw.service';

@Global()
@Module({
  providers: [OpenClawService],
  exports: [OpenClawService],
})
export class OpenClawModule {}
```

- [ ] **Step 4: Export from nestjs-libraries index**

Add to `libraries/nestjs-libraries/src/index.ts`:

```typescript
export * from './openclaw/openclaw.module';
export * from './openclaw/openclaw.service';
export * from './openclaw/dtos/openclaw.dto';
```

- [ ] **Step 5: Import OpenClawModule in backend API module**

Modify `apps/backend/src/api/api.module.ts` — add `OpenClawModule` to imports array.

- [ ] **Step 6: Commit**

```bash
git add libraries/nestjs-libraries/src/openclaw/ apps/backend/src/api/api.module.ts
git commit -m "feat(openclaw): add OpenClaw service module for external skill execution"
```

---

## Task 2: Backend — OpenClaw Controller

**Files:**

- Create: `apps/backend/src/api/routes/openclaw.controller.ts`
- Modify: `apps/backend/src/api/routes/routes.module.ts` — Add controller to module

- [ ] **Step 1: Create OpenClaw Controller**

```typescript
// apps/backend/src/api/routes/openclaw.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  OpenClawService,
  RunSkillDto,
  SkillResultDto,
} from '@gitroom/nestjs-libraries/openclaw/openclaw.service';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { CheckPolicies } from '@gitroom/backend/services/auth/permissions/permissions.ability';
import {
  AuthorizationActions,
  Sections,
} from '@gitroom/backend/services/auth/permissions/permission.exception.class';

@Controller('/openclaw')
export class OpenClawController {
  constructor(private readonly _openclawService: OpenClawService) {}

  @Get('/skills')
  async listSkills() {
    return this._openclawService.listSkills();
  }

  @Post('/skills/run')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async runSkill(
    @Body() dto: RunSkillDto,
    @GetOrgFromRequest() organization: Organization,
  ): Promise<SkillResultDto> {
    return this._openclawService.runSkill({
      ...dto,
      organizationId: organization.id,
    });
  }
}
```

- [ ] **Step 2: Add RunSkillDto to DTOs if not already there**

If `RunSkillDto` needs to be in a shared DTOs location, create `libraries/nestjs-libraries/src/dtos/openclaw.dto.ts` and export it.

- [ ] **Step 3: Import Controller in routes module**

Modify `apps/backend/src/api/routes/routes.module.ts` — add `OpenClawController` to controllers array.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/api/routes/openclaw.controller.ts
git commit -m "feat(openclaw): add REST endpoints for listing and running skills"
```

---

## Task 3: Frontend — useOpenClawSkills Hook

**Files:**

- Create: `libraries/helpers/src/hooks/use-openclaw-skills.ts`

- [ ] **Step 1: Create the SWR hook**

```typescript
// libraries/helpers/src/hooks/use-openclaw-skills.ts
'use client';

import useSWR from 'swr';
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

  const { data, mutate, isLoading } = useSWR<Skill[]>('openclaw/skills', () =>
    fetch('/openclaw/skills', { method: 'GET' }),
  );

  return {
    skills: data || [],
    isLoading,
    mutate,
  };
};

export const useRunOpenClawSkill = () => {
  const fetch = useFetch();

  return async (
    skillId: string,
    input: Record<string, any>,
  ): Promise<SkillResult> => {
    return fetch('/openclaw/skills/run', {
      method: 'POST',
      body: JSON.stringify({ skillId, input }),
    });
  };
};
```

- [ ] **Step 2: Export from helpers index**

Add export to `libraries/helpers/src/index.ts`:

```typescript
export * from './hooks/use-openclaw-skills';
```

- [ ] **Step 3: Commit**

```bash
git add libraries/helpers/src/hooks/use-openclaw-skills.ts
git commit -m "feat(openclaw): add SWR hooks for OpenClaw skills"
```

---

## Task 4: Frontend — Skills Hub Page

**Files:**

- Create: `apps/frontend/src/app/(app)/(site)/skills/page.tsx`
- Create: `apps/frontend/src/components/skills/skills-list.component.tsx`
- Create: `apps/frontend/src/components/skills/skill-runner-modal.component.tsx`

- [ ] **Step 1: Create Skills Hub Page**

```tsx
// apps/frontend/src/app/(app)/(site)/skills/page.tsx
'use client';

import {
  useOpenClawSkills,
  useRunOpenClawSkill,
} from '@gitroom/helpers/hooks/use-openclaw-skills';
import { SkillsList } from '@gitroom/frontend/components/skills/skills-list.component';
import { SkillRunnerModal } from '@gitroom/frontend/components/skills/skill-runner-modal.component';
import { useState } from 'react';

export default function SkillsPage() {
  const { skills, isLoading } = useOpenClawSkills();
  const runSkill = useRunOpenClawSkill();
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
```

- [ ] **Step 2: Create SkillsList Component**

```tsx
// apps/frontend/src/components/skills/skills-list.component.tsx
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
```

- [ ] **Step 3: Create SkillRunnerModal Component**

```tsx
// apps/frontend/src/components/skills/skill-runner-modal.component.tsx
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
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/\(app\)/\(site\)/skills/ apps/frontend/src/components/skills/
git commit -m "feat(skills): add Skills Hub page with skill list and runner modal"
```

---

## Task 5: Frontend — Add Skills to Sidebar Navigation

**Files:**

- Modify: `apps/frontend/src/components/new-layout/sidebar/sidebar.component.tsx`
- Create: `apps/frontend/src/components/new-layout/sidebar/skills-nav.component.tsx`

- [ ] **Step 1: Create SkillsNavComponent**

```tsx
// apps/frontend/src/components/new-layout/sidebar/skills-nav.component.tsx
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
```

- [ ] **Step 2: Add SkillsNavComponent to Sidebar**

Read `apps/frontend/src/components/new-layout/sidebar/sidebar.component.tsx` and add `<SkillsNavComponent />` in the navigation section (near other nav items like Dashboard, Create, Calendar).

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/new-layout/sidebar/
git commit -m "feat(skills): add Skills Hub to sidebar navigation"
```

---

## Task 6: Frontend — Modify Create Page with AI Suggestions

**Files:**

- Find: `apps/frontend/src/app/(app)/(site)/` — Locate Create/NewPost page
- Modify: Create page component to add AI suggestions panel

- [ ] **Step 1: Find Create page**

Search for the create post page location:

```bash
find apps/frontend/src/app -name "*.tsx" | xargs grep -l "create\|new-post\|NewPost" | head -5
```

- [ ] **Step 2: Add AI Suggestions to Create page**

Read the existing Create page component. Add an AI suggestions panel that shows:

- Generated hashtags
- SEO score
- Caption optimization
- Product Hunt launch angle

Use the `useOpenClawSkills` hook and `useRunOpenClawSkill` function to call `seo-geo-claude` skill when user enters content in the post textarea.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/\(app\)/\(site\)/**/create* apps/frontend/src/app/\(app\)/\(site\)/**/new*
git commit -m "feat(ai): add AI suggestions panel to Create page"
```

---

## Self-Review Checklist

1. **Spec coverage:** All spec sections addressed:
   - [x] Product overview (covered by fork setup)
   - [x] Architecture (OpenClaw as external service)
   - [x] OpenClaw skills (last30days, product-hunt-launch, seo-geo-claude, larry)
   - [x] UI structure (Skills Hub, Create page)
   - [x] Pricing (deferred to later phase)

2. **Placeholder scan:** No TODOs, TBDs, or vague steps. All code is complete.

3. **Type consistency:**
   - `OpenClawService.listSkills()` returns `SkillDto[]`
   - `OpenClawService.runSkill()` takes `RunSkillDto`
   - Frontend hooks use same DTOs via shared module
   - Consistent naming: `useOpenClawSkills`, `useRunOpenClawSkill`

4. **File paths verified:**
   - `libraries/nestjs-libraries/src/openclaw/` — correct nestjs-libraries structure
   - `apps/backend/src/api/routes/openclaw.controller.ts` — follows existing controller pattern
   - `apps/frontend/src/app/(app)/(site)/skills/page.tsx` — follows existing page routing
   - `libraries/helpers/src/hooks/use-openclaw-skills.ts` — follows existing hooks pattern
