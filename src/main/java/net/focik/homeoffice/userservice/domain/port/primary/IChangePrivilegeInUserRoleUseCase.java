package net.focik.homeoffice.userservice.domain.port.primary;

import java.util.List;
import java.util.Map;

public interface IChangePrivilegeInUserRoleUseCase {
    void changePrivilegesInUserRole(Long idUser, Long idRole, Map<String, String> privilegesToAdd);
}
