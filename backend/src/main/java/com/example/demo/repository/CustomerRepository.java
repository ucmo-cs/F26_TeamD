
package com.example.demo.repository;

// Import our Customer class from the domain package
import com.example.demo.domain.Customer;
import java.util.Optional;

// JpaRepository gives us built-in database operations
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repository connects our Java application to the customers table
// Customer = entity (table) we're working with
// Integer = data type of customer_id (primary key)
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    // Spring Data JPA automatically provides:
    // findAll()       -> Get all customers
    // findById(id)    -> Find a customer by ID
    // save(customer)  -> Insert or update a customer
    // deleteById(id)  -> Delete a customer
    // No need to write SQL for these basic operations!
    boolean existsByEmail(String email);

    Optional<Customer> findByEmail(String email);;
}
