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
import * as React from 'react';
import { Profile } from '../../../api/quality-profiles';
import { deleteRule, getRuleDetails, updateRule } from '../../../api/rules';
import ConfirmButton from '../../../components/controls/ConfirmButton';
import HelpTooltip from '../../../components/controls/HelpTooltip';
import { Button } from '../../../components/controls/buttons';
import Spinner from '../../../components/ui/Spinner';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import { Dict, RuleActivation, RuleDetails as TypeRuleDetails } from '../../../types/types';
import { Activation } from '../query';
import CustomRuleButton from './CustomRuleButton';
import RuleDetailsCustomRules from './RuleDetailsCustomRules';
import RuleDetailsDescription from './RuleDetailsDescription';
import RuleDetailsIssues from './RuleDetailsIssues';
import RuleDetailsMeta from './RuleDetailsMeta';
import RuleDetailsParameters from './RuleDetailsParameters';
import RuleDetailsProfiles from './RuleDetailsProfiles';

interface Props {
  allowCustomRules?: boolean;
  canWrite?: boolean;
  onActivate: (profile: string, rule: string, activation: Activation) => void;
  onDeactivate: (profile: string, rule: string) => void;
  onDelete: (rule: string) => void;
  referencedProfiles: Dict<Profile>;
  referencedRepositories: Dict<{ key: string; language: string; name: string }>;
  ruleKey: string;
  selectedProfile?: Profile;
}

interface State {
  actives?: RuleActivation[];
  loading: boolean;
  ruleDetails?: TypeRuleDetails;
}

export default class RuleDetails extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { loading: true };

  componentDidMount() {
    this.mounted = true;
    this.setState({ loading: true });
    this.fetchRuleDetails();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.ruleKey !== this.props.ruleKey) {
      this.setState({ loading: true });
      this.fetchRuleDetails();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchRuleDetails = () => {
    return getRuleDetails({
      actives: true,
      key: this.props.ruleKey,
    }).then(
      ({ actives, rule }) => {
        if (this.mounted) {
          this.setState({ actives, loading: false, ruleDetails: rule });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      }
    );
  };

  handleRuleChange = (ruleDetails: TypeRuleDetails) => {
    if (this.mounted) {
      this.setState({ ruleDetails });
    }
  };

  handleTagsChange = (tags: string[]) => {
    // optimistic update
    const oldTags = this.state.ruleDetails && this.state.ruleDetails.tags;
    this.setState((state) =>
      state.ruleDetails ? { ruleDetails: { ...state.ruleDetails, tags } } : null
    );
    updateRule({
      key: this.props.ruleKey,
      tags: tags.join(),
    }).catch(() => {
      if (this.mounted) {
        this.setState((state) =>
          state.ruleDetails ? { ruleDetails: { ...state.ruleDetails, tags: oldTags } } : null
        );
      }
    });
  };

  handleActivate = () => {
    return this.fetchRuleDetails().then(() => {
      const { ruleKey, selectedProfile } = this.props;
      if (selectedProfile && this.state.actives) {
        const active = this.state.actives.find((active) => active.qProfile === selectedProfile.key);
        if (active) {
          this.props.onActivate(selectedProfile.key, ruleKey, active);
        }
      }
    });
  };

  handleDeactivate = () => {
    return this.fetchRuleDetails().then(() => {
      const { ruleKey, selectedProfile } = this.props;
      if (
        selectedProfile &&
        this.state.actives &&
        !this.state.actives.find((active) => active.qProfile === selectedProfile.key)
      ) {
        this.props.onDeactivate(selectedProfile.key, ruleKey);
      }
    });
  };

  handleDelete = () => {
    return deleteRule({ key: this.props.ruleKey }).then(() =>
      this.props.onDelete(this.props.ruleKey)
    );
  };

  render() {
    const { ruleDetails } = this.state;

    if (!ruleDetails) {
      return <div className="coding-rule-details" />;
    }

    const { allowCustomRules, canWrite, referencedProfiles } = this.props;
    const { params = [] } = ruleDetails;

    const isCustom = !!ruleDetails.templateKey;
    const isEditable = canWrite && !!this.props.allowCustomRules && isCustom;

    return (
      <div className="coding-rule-details">
        <Spinner loading={this.state.loading}>
          <RuleDetailsMeta
            canWrite={canWrite}
            onTagsChange={this.handleTagsChange}
            referencedRepositories={this.props.referencedRepositories}
            ruleDetails={ruleDetails}
          />

          <RuleDetailsDescription
            canWrite={canWrite}
            onChange={this.handleRuleChange}
            ruleDetails={ruleDetails}
          />

          {params.length > 0 && <RuleDetailsParameters params={params} />}

          {isEditable && (
            <div className="coding-rules-detail-description display-flex-center">
              {/* `templateRule` is used to get rule meta data, `customRule` is used to get parameter values */}
              {/* it's expected to pass the same rule to both parameters */}
              <CustomRuleButton
                customRule={ruleDetails}
                onDone={this.handleRuleChange}
                templateRule={ruleDetails}
              >
                {({ onClick }) => (
                  <Button
                    className="js-edit-custom"
                    id="coding-rules-detail-custom-rule-change"
                    onClick={onClick}
                  >
                    {translate('edit')}
                  </Button>
                )}
              </CustomRuleButton>
              <ConfirmButton
                confirmButtonText={translate('delete')}
                isDestructive
                modalBody={translateWithParameters(
                  'coding_rules.delete.custom.confirm',
                  ruleDetails.name
                )}
                modalHeader={translate('coding_rules.delete_rule')}
                onConfirm={this.handleDelete}
              >
                {({ onClick }) => (
                  <>
                    <Button
                      className="button-red spacer-left js-delete"
                      id="coding-rules-detail-rule-delete"
                      onClick={onClick}
                    >
                      {translate('delete')}
                    </Button>
                    <HelpTooltip
                      className="spacer-left"
                      overlay={
                        <div className="big-padded-top big-padded-bottom">
                          {translate('coding_rules.custom_rule.removal')}
                        </div>
                      }
                    />
                  </>
                )}
              </ConfirmButton>
            </div>
          )}

          {ruleDetails.isTemplate && (
            <RuleDetailsCustomRules
              canChange={allowCustomRules && canWrite}
              ruleDetails={ruleDetails}
            />
          )}

          {!ruleDetails.isTemplate && (
            <RuleDetailsProfiles
              activations={this.state.actives}
              onActivate={this.handleActivate}
              onDeactivate={this.handleDeactivate}
              referencedProfiles={referencedProfiles}
              ruleDetails={ruleDetails}
            />
          )}

          {!ruleDetails.isTemplate && ruleDetails.type !== 'SECURITY_HOTSPOT' && (
            <RuleDetailsIssues ruleDetails={ruleDetails} />
          )}
        </Spinner>
      </div>
    );
  }
}
