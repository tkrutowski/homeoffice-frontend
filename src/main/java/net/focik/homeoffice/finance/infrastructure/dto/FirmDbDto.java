package net.focik.homeoffice.finance.infrastructure.dto;

import lombok.*;

import javax.persistence.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "finance_firma")
public class FirmDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    private Integer idAddress;
    private String name;
    private String phone;
    private String phone2;
    private String fax;
    private String mail;
    private String www;
    private String otherInfo;
}