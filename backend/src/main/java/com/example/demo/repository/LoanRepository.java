
package com.example.demo.repository;

import com.example.demo.domain.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

// Repository lets Spring Boot access the loan table
// Loan = entity we're working with
// Integer = data type of loan_id (primary key)
public interface LoanRepository extends JpaRepository<Loan, Integer> {

    // Spring Data JPA automatically provides:
    // findAll()      -> Get all loans
    // findById(id)   -> Find a loan by its ID
    // save(loan)     -> Insert or update a loan
    // deleteById(id) -> Delete a loan

    // No SQL needed for these basic operations!
}
