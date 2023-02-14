package net.focik.homeoffice.userservice.domain.port.primary;

import net.focik.homeoffice.userservice.domain.Role;

public interface ISaveRoleUseCase {
    Role saveRole(Role role);
}
