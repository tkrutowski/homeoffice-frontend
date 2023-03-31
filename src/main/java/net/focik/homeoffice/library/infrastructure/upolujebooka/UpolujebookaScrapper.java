package net.focik.homeoffice.library.infrastructure.upolujebooka;

import net.focik.homeoffice.library.domain.model.BookDto;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class UpolujebookaScrapper {

    public static final String DIV_PUBLISHER = "div.publisher";

    private UpolujebookaScrapper() {
    }

    private static final String PAGE_URL = "https://upolujebooka.pl";

    public static List<String> findBooksFromUrl(String url) {
        List<String> booksUrl = new ArrayList<>();
        try {
            if (!url.isEmpty()) {
                Document documentURL = Jsoup.connect(url).get();
                Element content = documentURL.getElementById("content");
                Elements links = content.getElementsByTag("a");
                return links.stream()
                        .map(element -> element.attr("href"))
                        .filter(s -> s.startsWith("/oferta"))
                        .distinct()
                        .map(PAGE_URL::concat)
                        .collect(Collectors.toList());
            }
        } catch (Exception exception) {
            exception.printStackTrace();
        }

        return booksUrl;
    }

    public static BookDto findBookFromUrl(String url) {
        BookScraperDto book = new BookScraperDto();
        book.setId(0);
        try {
            if (!url.isEmpty()) {
                Document documentURL = Jsoup.connect(url).get();
                if (documentURL.select(DIV_PUBLISHER).text().startsWith("Cykl: ")) {
                    book.setSeries(documentURL
                            .select(DIV_PUBLISHER)
                            .text()
                            .substring(documentURL
                                            .select(DIV_PUBLISHER)
                                            .text()
                                            .indexOf(": ") + 2,
                                    documentURL
                                            .select(DIV_PUBLISHER)
                                            .text()
                                            .indexOf(" (")
                            )
                    );
                    book.setSeriesURL(PAGE_URL + documentURL.select("div.publisher > span > a")
                            .attr("href"));
                    book.setBookInSeriesNo(Optional.of(Integer.parseInt(documentURL.select("div.publisher > span > a > b").text())).orElse(-1));
                } else {
                    book.setSeries("");
                }
                book.setAuthors((documentURL.select("div.authors > h2 >a").textNodes().stream()
                        .map(TextNode::toString)
                        .collect(Collectors.joining(", "))));
                book.setCategories(documentURL.select("div.container > ol > li > span > a").eachText().stream()
                        .map(Object::toString)
                        .collect(Collectors.joining(",")));
                book.setTitle(documentURL.select("div.col-lg-6.col-md-8.col-sm-8 > h1").first().childNode(0).toString().trim());
                book.setDescription(documentURL.select("div.description > p").text());
                book.setCover(PAGE_URL + "/" + documentURL.select(" Div.DetailImage > img ").first().attr("src"));

            }
        } catch (Exception exception) {
            exception.printStackTrace();
            book = BookScraperDto.createEmptyDto();
        }
        return book;
    }

}