
package com.example.demo.repository;

// Import our Customer class from the domain package
import com.example.demo.domain.Customer;

// JpaRepository gives us built-in database operations
import org.springframework.data.jpa.repository.JpaRepository;

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
}
