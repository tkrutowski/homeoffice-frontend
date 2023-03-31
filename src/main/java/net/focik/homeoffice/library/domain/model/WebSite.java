package net.focik.homeoffice.library.domain.model;


public enum WebSite {
    UPOLUJ_EBOOKA("upolujebooka.pl"), EMPIK("empik.com");

    private final String url;

    WebSite(String url) {
        this.url = url;
    }

    public String getUrl() {
        return this.url;
    }
}
