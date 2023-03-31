package net.focik.homeoffice.library.api;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.library.api.dto.SeriesDto;
import net.focik.homeoffice.library.domain.LibraryFacade;
import net.focik.homeoffice.library.domain.model.Series;
import net.focik.homeoffice.library.infrastructure.upolujebooka.UpolujebookaScrapper;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@RestController
@RequestMapping("/api/library/series")
public class SeriesController {

    private final LibraryFacade facade;
    private final ModelMapper mapper;

    //    SeriesService seriesService;
//
//    @PostMapping
//    public Long addSeries(@RequestBody Series series) {
//        return seriesService.addSeries(series);
//    }
//
//    @PutMapping("/{id}")
//    public Series editSeries(@RequestBody Series series, @PathVariable Long id) {
//        return seriesService.editSeries(series, id);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteSeries(@PathVariable Long id) {
//        seriesService.deleteSeries(id);
//    }
//
//    @GetMapping("/{id}")
//    public Series findSeries(@PathVariable Long id) {
//        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        return seriesService.findSeries(id);
//    }
//
    @GetMapping("/check")
    ResponseEntity<List<String>> checkNewBooksInSeries() {//@RequestParam List<Integer> idSeriesList) {
//    List<Book> allBooks = findBookUseCase.checkNewBooksInSeries(idSeriesList);
//    return new ResponseEntity<>(allBooks.stream()
//            .map(bookMapper::toDto)
//            .collect(Collectors.toList()), HttpStatus.OK);
        List<String> booksFromUrl = UpolujebookaScrapper.findBooksFromUrl("https://upolujebooka.pl/cykl,3523,gerard_edling.html");

        return new ResponseEntity<>(booksFromUrl, HttpStatus.OK);
    }

    @GetMapping
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<List<SeriesDto>> findAllSeries() {
//        return seriesService.findAllSeries();
        List<Series> allSeries = facade.getAllSeries();
        return new ResponseEntity<>(allSeries.stream()
                .map(series -> mapper.map(series, SeriesDto.class))
                .collect(Collectors.toList()), HttpStatus.OK);
    }
}
