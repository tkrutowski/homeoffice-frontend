package net.focik.homeoffice.userservice.domain.port.primary;

public interface IChangePasswordUseCase {

    void changePassword(Long id, String oldPassword, String newPassword);
}
