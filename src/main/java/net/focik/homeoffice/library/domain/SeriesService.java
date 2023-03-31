package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.exception.SeriesAlreadyExistException;
import net.focik.homeoffice.library.domain.exception.SeriesNotFoundException;
import net.focik.homeoffice.library.domain.model.Series;
import net.focik.homeoffice.library.domain.port.secondary.SeriesRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeriesService {

    private final SeriesRepository seriesRepository;

    public Integer addSeries(Series series) {
        Optional<Series> optionalSeries = seriesRepository.findByTitle(series.getTitle());
        if (optionalSeries.isPresent()) {
            throw new SeriesAlreadyExistException(series);
        }
        return seriesRepository.add(series);
    }

    public Series editSeries(Series series, Integer id) {
        Optional<Series> seriesById = seriesRepository.findById(id);
        if (seriesById.isEmpty()) {
            throw new SeriesNotFoundException(id);
        }
        seriesById.get().setTitle(series.getTitle());
        seriesById.get().setDescription(series.getDescription());

        return seriesRepository.edit(seriesById.get()).get();
    }

    public void deleteSeries(Integer id) {
        seriesRepository.delete(id);
    }

    public Series findSeries(Integer id) {
        Optional<Series> seriesOptional = seriesRepository.findById(id);
        if (seriesOptional.isEmpty()) {
            throw new SeriesNotFoundException(id);
        }
        return seriesOptional.get();
    }

    public Series findSeriesByTitle(String title) {
        Optional<Series> seriesOptional = seriesRepository.findByTitle(title);
        if (seriesOptional.isEmpty()) {
            throw new SeriesNotFoundException(title);
        }
        return seriesOptional.get();
    }

    public List<Series> getAllSeries() {
        return seriesRepository.findAll().stream()
                .sorted(Comparator.comparing(Series::getTitle))
                .collect(Collectors.toList());
    }
}
