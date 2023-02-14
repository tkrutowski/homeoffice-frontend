package net.focik.homeoffice.userservice.infrastructure.dto;

import javax.persistence.*;

@Entity
@Table(name = "roles")
public class RoleDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}
