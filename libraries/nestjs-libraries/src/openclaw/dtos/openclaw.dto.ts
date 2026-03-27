import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class SkillDto {
  @IsString()
  id!: string;
  @IsString()
  name!: string;
  @IsString()
  description!: string;
  @IsOptional()
  @IsString()
  icon?: string;
}

export class RunSkillDto {
  @IsString()
  skillId!: string;
  @IsObject()
  input!: Record<string, any>;
  @IsString()
  organizationId!: string;
}

export class SkillResultDto {
  @IsString()
  skillId!: string;
  @IsObject()
  output!: Record<string, any>;
  @IsString()
  @IsIn(['completed', 'failed', 'running'])
  status!: 'completed' | 'failed' | 'running';
}

export interface OpenClawSkillResponse {
  output?: Record<string, any>;
  error?: string;
}
