package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.library.domain.model.Series;
import net.focik.homeoffice.utils.exceptions.ObjectAlreadyExistException;

public class SeriesAlreadyExistException extends ObjectAlreadyExistException {
    public SeriesAlreadyExistException(Series series) {
        super("Series already exists: " + series.toString());
    }
}
