'use client';

import { SkillsNavComponent } from './skills-nav.component';

export const SidebarComponent = () => {
  return (
    <div className="flex flex-col gap-[8px]">
      <SkillsNavComponent />
    </div>
  );
};
