import { Controller, Get, Post, Body } from '@nestjs/common';
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
