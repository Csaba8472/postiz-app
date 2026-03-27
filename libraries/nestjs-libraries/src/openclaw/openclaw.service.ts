import { Injectable, Logger } from '@nestjs/common';
import {
  SkillDto,
  RunSkillDto,
  SkillResultDto,
  OpenClawSkillResponse,
} from './dtos/openclaw.dto';

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

      const result: OpenClawSkillResponse = await response.json();
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
