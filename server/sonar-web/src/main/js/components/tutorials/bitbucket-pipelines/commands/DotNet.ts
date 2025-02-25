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
export default function dotNetExample(
  branchesEnabled: boolean,
  mainBranchName: string,
  projectKey: string
) {
  return `image: mcr.microsoft.com/dotnet/sdk:7.0

definitions:
  steps:
    - step: &build-step
        name: SonarQube analysis
        caches:
          - dotnetcore
          - sonar
        script:
          - apt-get update
          - apt-get install --yes --no-install-recommends openjdk-17-jre
          - dotnet tool install --global dotnet-sonarscanner
          - export PATH="$PATH:/root/.dotnet/tools"
          - dotnet sonarscanner begin /k:"${projectKey}" /d:"sonar.token=\${SONAR_TOKEN}"  /d:"sonar.host.url=\${SONAR_HOST_URL}"
          - dotnet build 
          - dotnet sonarscanner end /d:"sonar.token=\${SONAR_TOKEN}"
  caches:
    sonar: ~/.sonar

pipelines:
  branches:
    '{${mainBranchName}}':
      - step: *build-step
${
  branchesEnabled
    ? `
  pull-requests:
    '**':
      - step: *build-step`
    : ''
}`;
}
