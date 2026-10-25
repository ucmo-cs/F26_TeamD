
package com.example.demo.controller;

import com.example.demo.domain.Customer;
import com.example.demo.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

// Tells Spring Boot this class handles API requests
@RestController

// All customer endpoints start with /api/customers
@RequestMapping("/api/customers")
public class CustomerController {

    // Connect our controller to CustomerService
    private final CustomerService customerService;

    // Spring Boot automatically provides CustomerService
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // POST: Create a new customer
    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @RequestBody Customer customer) {

        // Send the customer information to CustomerService
        Customer savedCustomer =
                customerService.createCustomer(customer);

        // Return HTTP 201 Created with the saved customer
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedCustomer);
    }


    // GET: Retrieve all customers
    @GetMapping
    public List<Customer> getAllCustomers() {

        // Ask CustomerService to retrieve customers from MySQL
        return customerService.getAllCustomers();
    }

    // GET: Retrieve one customer by ID
    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Integer id) {

        // Ask CustomerService to find this specific customer
        return customerService.getCustomerById(id);
    }


    // PUT: Update an existing customer's information
    @PutMapping("/{id}")
    public Customer updateCustomer(
            @PathVariable Integer id,
            @RequestBody Customer updatedCustomer) {

        // Pass the customer ID and new information to the service
        return customerService.updateCustomer(id, updatedCustomer);
    }


    // DELETE: Remove a customer using their ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {

        // Call the service to delete the customer
        customerService.deleteCustomer(id);

        // Return HTTP 204 when deletion succeeds
        return ResponseEntity.noContent().build();
    }



}
