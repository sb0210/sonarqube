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
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { byLabelText, byText } from '../../../helpers/testSelector';
import DismissableAlertComponent, {
  DismissableAlertComponentProps,
} from '../DismissableAlertComponent';

it('should render with children', () => {
  render();
  expect(byText('testing').get()).toBeVisible();
});

it('calls onDismiss', async () => {
  const onDismiss = jest.fn();
  render({ onDismiss });
  const user = userEvent.setup();
  await user.click(byLabelText('alert.dismiss').get());
  expect(onDismiss).toHaveBeenCalled();
});

function render(props: Partial<DismissableAlertComponentProps> = {}) {
  return renderComponent(
    <DismissableAlertComponent onDismiss={jest.fn()} variant="info" {...props}>
      testing
    </DismissableAlertComponent>
  );
}
