
package com.example.demo.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// @Entity and @Table Tells my spring boot that this class here represents the customer table
// @Getter and @Setter lombok automatically creates methods to read and update fields, so we don't have to write them manually.

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customer {


    // @ID and @GeneratedValue This represents the primary key customer_id. MySQL automatically
    // generates its value when a customer is inserted.
    // @ Column this maps the Java email variable to the MySQL email column.
    //- nullable = false means email cannot be NULL.
    //- unique = true means two customers cannot have the same email.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    // Accept passwords in requests, but never return them in API responses
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false)
    private String password;


}
