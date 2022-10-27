/*
 * SonarQube
 * Copyright (C) 2009-2022 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { colors } from '../app/theme';
import { AlmKeys } from '../types/alm-settings';
import { ComponentQualifier } from '../types/component';
import { IssueScope, IssueType } from '../types/issues';
import { RuleType } from '../types/types';

export const SEVERITIES = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
export const STATUSES = ['OPEN', 'REOPENED', 'CONFIRMED', 'RESOLVED', 'CLOSED'];
export const ISSUE_TYPES: IssueType[] = [
  IssueType.Bug,
  IssueType.Vulnerability,
  IssueType.CodeSmell,
  IssueType.SecurityHotspot
];
export const SOURCE_SCOPES = [
  { scope: IssueScope.Main, qualifier: ComponentQualifier.File },
  { scope: IssueScope.Test, qualifier: ComponentQualifier.TestFile }
];
export const RULE_TYPES: RuleType[] = ['BUG', 'VULNERABILITY', 'CODE_SMELL', 'SECURITY_HOTSPOT'];
export const RULE_STATUSES = ['READY', 'BETA', 'DEPRECATED'];

export const RATING_COLORS = [
  { fill: colors.success300, fillTransparent: colors.success300a20, stroke: colors.success500 },
  {
    fill: colors.successVariant,
    fillTransparent: colors.successVarianta20,
    stroke: colors.successVariantDark
  },
  {
    fill: colors.warningVariant,
    fillTransparent: colors.warningVarianta20,
    stroke: colors.warningVariantDark
  },
  { fill: colors.warningAccent, fillTransparent: colors.warningAccenta20, stroke: colors.warning },
  { fill: colors.error400, fillTransparent: colors.error400a20, stroke: colors.error700 }
];

export const PROJECT_KEY_MAX_LEN = 400;

export const ALM_DOCUMENTATION_PATHS = {
  [AlmKeys.Azure]: '/analysis/azuredevops-integration/',
  [AlmKeys.BitbucketServer]: '/analysis/bitbucket-integration/',
  [AlmKeys.BitbucketCloud]: '/analysis/bitbucket-cloud-integration/',
  [AlmKeys.GitHub]: '/analysis/github-integration/',
  [AlmKeys.GitLab]: '/analysis/gitlab-integration/'
};

export const IMPORT_COMPATIBLE_ALMS = [
  AlmKeys.Azure,
  AlmKeys.BitbucketServer,
  AlmKeys.BitbucketCloud,
  AlmKeys.GitHub,
  AlmKeys.GitLab
];

// Count both Bitbuckets as a single ALM.
export const IMPORT_COMPATIBLE_ALM_COUNT = IMPORT_COMPATIBLE_ALMS.filter(
  a => a !== AlmKeys.BitbucketCloud
).length;

export const GRADLE_SCANNER_VERSION = '3.4.0.2513';
