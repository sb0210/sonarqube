/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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

import { withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ClipboardIconButton,
  IssueMessageHighlighting,
  LAYOUT_GLOBAL_NAV_HEIGHT,
  LAYOUT_PROJECT_NAV_HEIGHT,
  LightLabel,
  LightPrimary,
  Link,
  LinkIcon,
  StyledPageTitle,
  Theme,
  themeColor,
  themeShadow,
} from 'design-system';
import React from 'react';
import { getBranchLikeQuery } from '../../../helpers/branch-like';
import { translate } from '../../../helpers/l10n';
import {
  getComponentSecurityHotspotsUrl,
  getPathUrlAsString,
  getRuleUrl,
} from '../../../helpers/urls';
import { useRefreshBranchStatus } from '../../../queries/branch';
import { BranchLike } from '../../../types/branch-like';
import { SecurityStandard, Standards } from '../../../types/security';
import { Hotspot, HotspotStatusOption } from '../../../types/security-hotspots';
import { Component } from '../../../types/types';
import HotspotHeaderRightSection from './HotspotHeaderRightSection';
import HotspotSnippetHeader from './HotspotSnippetHeader';
import Status from './status/Status';
import StatusReviewButton from './status/StatusReviewButton';

export interface HotspotHeaderProps {
  hotspot: Hotspot;
  component: Component;
  branchLike?: BranchLike;
  isCodeTab?: boolean;
  standards?: Standards;
  onUpdateHotspot: (statusUpdate?: boolean, statusOption?: HotspotStatusOption) => Promise<void>;
  tabs: React.ReactNode;
  isScrolled: boolean;
  isCompressed: boolean;
}

interface StyledHeaderProps {
  isScrolled: boolean;
  theme: Theme;
}

export function HotspotHeader(props: HotspotHeaderProps) {
  const { branchLike, component, hotspot, isCodeTab, isCompressed, isScrolled, standards, tabs } =
    props;
  const { message, messageFormattings, rule, key } = hotspot;
  const refrechBranchStatus = useRefreshBranchStatus();

  const permalink = getPathUrlAsString(
    getComponentSecurityHotspotsUrl(component.key, {
      ...getBranchLikeQuery(branchLike),
      hotspots: key,
    }),
    false
  );

  const categoryStandard = standards?.[SecurityStandard.SONARSOURCE][rule.securityCategory]?.title;
  const handleStatusChange = async (statusOption: HotspotStatusOption) => {
    await props.onUpdateHotspot(true, statusOption);
    refrechBranchStatus();
  };

  const content = isCompressed ? (
    <span>
      <div className="sw-flex sw-justify-between">
        {tabs}

        <StatusReviewButton hotspot={hotspot} onStatusChange={handleStatusChange} />
      </div>

      {isCodeTab && (
        <HotspotSnippetHeader hotspot={hotspot} component={component} branchLike={branchLike} />
      )}
    </span>
  ) : (
    <>
      <div className="sw-flex sw-justify-between sw-gap-8 sw-mb-4">
        <div className="sw-flex-1">
          <StyledPageTitle as="h2" className="sw-whitespace-normal sw-overflow-visible">
            <LightPrimary>
              <IssueMessageHighlighting message={message} messageFormattings={messageFormattings} />
            </LightPrimary>
            <ClipboardIconButton
              Icon={LinkIcon}
              copiedLabel={translate('copied_action')}
              copyLabel={translate('copy_to_clipboard')}
              className="sw-ml-2"
              copyValue={permalink}
              discreet
            />
          </StyledPageTitle>
          <div className="sw-mt-2 sw-mb-4 sw-body-sm">
            <LightLabel>{rule.name}</LightLabel>
            <Link className="sw-ml-1" to={getRuleUrl(rule.key)} target="_blank">
              {rule.key}
            </Link>
          </div>
          <Status hotspot={hotspot} onStatusChange={handleStatusChange} />
        </div>
        <div className="sw-flex sw-flex-col sw-gap-4">
          <HotspotHeaderRightSection
            hotspot={hotspot}
            categoryStandard={categoryStandard}
            onUpdateHotspot={props.onUpdateHotspot}
          />
        </div>
      </div>
      {tabs}

      {isCodeTab && (
        <HotspotSnippetHeader hotspot={hotspot} component={component} branchLike={branchLike} />
      )}
    </>
  );

  return (
    <Header
      className="sw-sticky sw--mx-6 sw--mt-6 sw-px-6 sw-pt-6 sw-pb-4 sw-z-filterbar-header"
      isScrolled={isScrolled}
    >
      {content}
    </Header>
  );
}

const Header = withTheme(styled.div<StyledHeaderProps>`
  background-color: ${themeColor('pageBlock')};
  box-shadow: ${({ isScrolled }: StyledHeaderProps) => (isScrolled ? themeShadow('sm') : 'none')};
  top: ${LAYOUT_GLOBAL_NAV_HEIGHT + LAYOUT_PROJECT_NAV_HEIGHT}px;
`);
