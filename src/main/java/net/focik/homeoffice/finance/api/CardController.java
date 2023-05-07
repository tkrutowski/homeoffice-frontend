package net.focik.homeoffice.finance.api;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.finance.api.dto.BasicDto;
import net.focik.homeoffice.finance.api.dto.CardDto;
import net.focik.homeoffice.finance.api.mapper.ApiCardMapper;
import net.focik.homeoffice.finance.domain.card.Card;
import net.focik.homeoffice.finance.domain.card.port.primary.AddCardUseCase;
import net.focik.homeoffice.finance.domain.card.port.primary.DeleteCardUseCase;
import net.focik.homeoffice.finance.domain.card.port.primary.GetCardUseCase;
import net.focik.homeoffice.finance.domain.card.port.primary.UpdateCardUseCase;
import net.focik.homeoffice.utils.exceptions.ExceptionHandling;
import net.focik.homeoffice.utils.exceptions.HttpResponse;
import net.focik.homeoffice.utils.share.ActiveStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.OK;

@Log4j2
@RestController
@AllArgsConstructor
@RequestMapping("/api/finance/card")
//@CrossOrigin
public class CardController extends ExceptionHandling {

    private final ApiCardMapper mapper;
    private final AddCardUseCase addCardUseCase;
    private final UpdateCardUseCase updateCardUseCase;
    private final GetCardUseCase getCardUseCase;
    private final DeleteCardUseCase deleteCardUseCase;


    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<CardDto> getById(@PathVariable int id) {

        log.info("Try find card by id: " + id);

        Card card = getCardUseCase.findById(id);

        log.info(card != null ? "Found card for id = " + id : "Not found card for id = " + id);

        if (card == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(mapper.toDto(card), OK);
    }

    @GetMapping("/{idUser}/status")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<CardDto>> getAll(@PathVariable int idUser, @RequestParam(required = false) ActiveStatus status) {
        log.info("Try get all card for idUser: " + idUser + " and status " + status);

        List<Card> cardsByUser = getCardUseCase.findByUser(idUser, status);

        log.info("Found " + cardsByUser.size() + " cards.");

        return new ResponseEntity<>(cardsByUser.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList()), OK);
    }

    @PostMapping
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_WRITE_ALL')")
    public ResponseEntity<CardDto> addCard(@RequestBody CardDto cardDto) {
        log.info("Try add new card.");

        Card card = mapper.toDomain(cardDto);
        Card result = addCardUseCase.addCard(card);

        log.info(result.getId() > 0 ? "Card added with id = " + result : "No card added!");

        if (result.getId() <= 0)
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(mapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_WRITE_ALL')")
    public ResponseEntity<CardDto> updateBank(@RequestBody CardDto cardDto) {
        log.info("Try update card with id: {}", cardDto.getId());

        Card card = updateCardUseCase.updateCard(mapper.toDomain(cardDto));
        return new ResponseEntity<>(mapper.toDto(card), OK);
    }

    @PutMapping("/status/{id}")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<HttpResponse> updatePurchaseStatus(@PathVariable int id, @RequestBody BasicDto basicDto) {
        log.info("Try update perchase status.");

        updateCardUseCase.updateCardStatus(id, ActiveStatus.valueOf(basicDto.getValue()));
        return response(HttpStatus.OK, "Zaaktualizowano status karty.");
    }

    @DeleteMapping("/{idCard}")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_DELETE_ALL')")
    public ResponseEntity<HttpResponse> deleteCard(@PathVariable int idCard) {
        log.info("Try delete card with id: " + idCard);

        deleteCardUseCase.deleteCard(idCard);

        log.info("Deleted bank with id = " + idCard);

        return response(HttpStatus.NO_CONTENT, "Karta usunięty.");
    }

    private ResponseEntity<HttpResponse> response(HttpStatus status, String message) {
        HttpResponse body = new HttpResponse(status.value(), status, status.getReasonPhrase(), message);
        return new ResponseEntity<>(body, status);
    }
}
