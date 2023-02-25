package net.focik.homeoffice.userservice.domain.port.secondary;

import net.focik.homeoffice.userservice.domain.Privilege;

public interface IPrivilegeRepository {

    //    Role addRole(Role role);
//    List<Role> getAllRoles();
//     Privilege getPrivilegeByName(String name);
    Privilege getPrivilegeById(Long id);

    Privilege save(Privilege privilege);
}
