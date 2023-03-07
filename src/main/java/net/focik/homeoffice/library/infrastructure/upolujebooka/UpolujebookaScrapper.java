package net.focik.homeoffice.library.infrastructure.upolujebooka;

import net.focik.homeoffice.library.domain.model.BookDto;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.TextNode;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.stream.Collectors;

@Component
public class UpolujebookaScrapper {
    private UpolujebookaScrapper() { }

    private static final String PAGE_URL = "https://upolujebooka.pl";

    public static BookDto findBookFromUrl(String url) {
        BookScraperDto book = new BookScraperDto();
        try {
            if (!url.isEmpty()) {
                StringBuilder pageContent = new ReadPageContent(url).invoke();
                Document documentURL = Jsoup.parse(pageContent.toString());

                if (documentURL.select("div.publisher").text().startsWith("Cykl: ")) {
                    book.setSeries(documentURL
                            .select("div.publisher")
                            .text()
                            .substring(documentURL
                                            .select("div.publisher")
                                            .text()
                                            .indexOf(": ") + 2,
                                    documentURL
                                            .select("div.publisher")
                                            .text()
                                            .indexOf(" (")
                            )
                    );
                    book.setBookInSeriesNo(Integer.parseInt(documentURL.select("div.publisher > span > a > b").text()));
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

    private static class ReadPageContent {
        private final String url;

        public ReadPageContent(String url) {
            this.url = url;
        }

        public StringBuilder invoke() throws IOException {
            InputStream inputStream;
            StringBuilder pageContent = new StringBuilder();
            String line;
            URL inputUrl = new URL(url);

            try {
                inputStream = inputUrl.openStream();

            } catch (Exception exception) {
                throw new IOException();
            }
            try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream))) {
                while ((line = bufferedReader.readLine()) != null) {
                    pageContent.append(line);
                }
            }
            return pageContent;
        }
    }
}
