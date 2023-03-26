package net.focik.homeoffice.library.domain.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.focik.homeoffice.userservice.domain.AppUser;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class UserBook {
        private Integer id;
        private Book book;
        private AppUser user;
        private Bookstore bookstore;
        private EditionType editionType;
        private ReadingStatus readingStatus;
        private OwnershipStatus ownershipStatus;
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private LocalDate readFrom;
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private LocalDate readTo;
        private String info;
}
