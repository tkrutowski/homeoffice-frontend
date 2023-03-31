package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class SeriesNotFoundException extends ObjectNotFoundException {
    public SeriesNotFoundException(Integer id) {
        super("Series with id = " + id + " not found");
    }
    public SeriesNotFoundException(String  title) {
        super("Series with title = " + title + " not found");
    }
}
