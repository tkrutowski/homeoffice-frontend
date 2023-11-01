package net.focik.homeoffice.utils;

import org.springframework.security.core.context.SecurityContextHolder;

public class UserHelper {
    private UserHelper() { }

    public static String getUserName() {

        return SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString();
    }
}
