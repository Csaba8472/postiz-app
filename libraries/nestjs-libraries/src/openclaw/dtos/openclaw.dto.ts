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
