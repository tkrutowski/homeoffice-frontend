package net.focik.homeoffice.userservice.domain.port.primary;

import net.focik.homeoffice.userservice.domain.Privilege;
import net.focik.homeoffice.userservice.domain.Role;

import java.util.List;

public interface IGetUserRolesUseCase {
    List<Role> getUserRoles(Long idUser);

    List<Role> getRoles();


//    Privilege getRoleDetailsDto(Long idUser, Long idRole);

    Privilege getRoleDetails(Long idUser, Long idRole);
}
