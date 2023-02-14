package net.focik.homeoffice.userservice.domain.port.primary;

import net.focik.homeoffice.userservice.domain.AppUser;

import java.util.List;

public interface IGetUserUseCase {
    AppUser findUserByUsername(String username);

    AppUser findUserById(Long id);

    List<AppUser> getAllUsers();

}
