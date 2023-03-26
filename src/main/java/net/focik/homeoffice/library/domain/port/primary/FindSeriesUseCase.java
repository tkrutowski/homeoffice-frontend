package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Series;

import java.util.List;

public interface FindSeriesUseCase {
    Series findSeries(Integer idSeries);

    List<Series> getAllSeries();
}
