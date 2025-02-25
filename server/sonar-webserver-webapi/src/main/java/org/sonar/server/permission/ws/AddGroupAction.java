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
package org.sonar.server.permission.ws;

import java.util.List;
import org.sonar.api.server.ws.Change;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.db.DbClient;
import org.sonar.db.DbSession;
import org.sonar.db.entity.EntityDto;
import org.sonar.db.user.GroupDto;
import org.sonar.server.common.management.ManagedInstanceChecker;
import org.sonar.server.permission.GroupPermissionChange;
import org.sonar.server.permission.PermissionChange;
import org.sonar.server.permission.PermissionService;
import org.sonar.server.permission.PermissionUpdater;
import org.sonar.server.user.UserSession;

import static org.sonar.server.permission.ws.WsParameters.createGroupNameParameter;
import static org.sonar.server.permission.ws.WsParameters.createProjectParameters;
import static org.sonarqube.ws.client.permission.PermissionsWsParameters.PARAM_PERMISSION;

public class AddGroupAction implements PermissionsWsAction {
  public static final String ACTION = "add_group";

  private final DbClient dbClient;
  private final UserSession userSession;
  private final PermissionUpdater<GroupPermissionChange> permissionUpdater;
  private final PermissionWsSupport wsSupport;
  private final WsParameters wsParameters;
  private final PermissionService permissionService;
  private final ManagedInstanceChecker managedInstanceChecker;

  public AddGroupAction(DbClient dbClient, UserSession userSession, PermissionUpdater<GroupPermissionChange> permissionUpdater, PermissionWsSupport wsSupport,
                        WsParameters wsParameters, PermissionService permissionService, ManagedInstanceChecker managedInstanceChecker) {
    this.dbClient = dbClient;
    this.userSession = userSession;
    this.permissionUpdater = permissionUpdater;
    this.wsSupport = wsSupport;
    this.wsParameters = wsParameters;
    this.permissionService = permissionService;
    this.managedInstanceChecker = managedInstanceChecker;
  }

  @Override
  public void define(WebService.NewController context) {
    WebService.NewAction action = context.createAction(ACTION)
      .setDescription("Add a permission to a group.<br /> " +
        "This service defaults to global permissions, but can be limited to project permissions by providing project id or project key.<br /> " +
        "The group name must be provided. <br />" +
        "Requires one of the following permissions:" +
        "<ul>" +
        "<li>'Administer System'</li>" +
        "<li>'Administer' rights on the specified project</li>" +
        "</ul>")
      .setSince("5.2")
      .setChangelog(
        new Change("10.0", "Parameter 'groupId' is removed. Use 'groupName' instead."),
        new Change("8.4", "Parameter 'groupId' is deprecated. Format changes from integer to string. Use 'groupName' instead."))
      .setPost(true)
      .setHandler(this);

    wsParameters.createPermissionParameter(action, "The permission you would like to grant to the group.");
    createGroupNameParameter(action);
    createProjectParameters(action);
  }

  @Override
  public void handle(Request request, Response response) throws Exception {
    try (DbSession dbSession = dbClient.openSession(false)) {
      GroupDto groupDto = wsSupport.findGroupDtoOrNullIfAnyone(dbSession, request);
      EntityDto entityDto = wsSupport.findEntity(dbSession, request);
      if (entityDto != null && entityDto.isProject()) {
        managedInstanceChecker.throwIfProjectIsManaged(dbSession, entityDto.getUuid());
      }
      wsSupport.checkPermissionManagementAccess(userSession, entityDto);
      GroupPermissionChange change = new GroupPermissionChange(
        PermissionChange.Operation.ADD,
        request.mandatoryParam(PARAM_PERMISSION),
        entityDto,
        groupDto,
        permissionService);
      permissionUpdater.apply(dbSession, List.of(change));
    }
    response.noContent();
  }
}
