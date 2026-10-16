
package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

// @Entity tells JPA this class represents a database table
@Entity
@Table(name = "loan")

// Lombok automatically creates getter and setter methods
@Getter
@Setter
public class Loan {

    // Primary key: MySQL automatically generates loan_id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_id")
    private Integer loanId;

    // Many loans can belong to one customer
    // customer_id is the foreign key in the loan table
    // Load the customer together with the loan
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Date when the loan was created
    @Column(name = "loan_date", nullable = false)
    private LocalDate loanDate;

    // Original amount borrowed
    @Column(name = "original_amount", nullable = false,
            precision = 12, scale = 2)
    private BigDecimal originalAmount;

    // Amount the customer still owes
    @Column(name = "remaining_balance", nullable = false,
            precision = 12, scale = 2)
    private BigDecimal remainingBalance;

    // Annual interest rate stored as a decimal
    // Example: 0.0650 represents 6.5%
    @Column(name = "interest_rate", nullable = false,
            precision = 5, scale = 4)
    private BigDecimal interestRate;
}
