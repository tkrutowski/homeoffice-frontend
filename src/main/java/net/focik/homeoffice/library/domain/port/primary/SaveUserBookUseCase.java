package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.UserBook;

public interface SaveUserBookUseCase {
    UserBook addUserBook(UserBook book, String userName);

    UserBook updateUserBook(UserBook book);
}
