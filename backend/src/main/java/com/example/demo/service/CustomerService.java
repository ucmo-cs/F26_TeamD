
package com.example.demo.service;

import com.example.demo.domain.Customer;
import com.example.demo.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerService {

    // Allows us to access the customers table in MySQL
    private final CustomerRepository customerRepository;

    // Used to securely hash passwords before saving them
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    // Spring Boot automatically provides the repository
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // POST: Create a new customer
    public Customer createCustomer(Customer customer) {

        // Make sure the customer has a name
        if (customer.getName() == null ||
                customer.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer name is required"
            );
        }

        // Make sure the customer has an email
        if (customer.getEmail() == null ||
                customer.getEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer email is required"
            );
        }

        // Make sure the customer has a password
        if (customer.getPassword() == null ||
                customer.getPassword().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer password is required"
            );
        }

        // Check whether the email already exists
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        // Never let the request choose the customer ID
        customer.setCustomerId(null);

        // Hash the password before saving it in MySQL
        customer.setPassword(
                passwordEncoder.encode(customer.getPassword())
        );

        // Save the customer in MySQL
        return customerRepository.save(customer);
    }


    // GET: Retrieve all customers from MySQL
    public List<Customer> getAllCustomers() {

        // findAll() retrieves every customer in the customers table
        return customerRepository.findAll();
    }

    // GET: Retrieve one customer using their customer ID
    public Customer getCustomerById(Integer customerId) {

        // Search MySQL for the customer
        return customerRepository.findById(customerId)

                // If the customer doesn't exist, return HTTP 404
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));
    }


    // PUT: Update an existing customer's information
    public Customer updateCustomer(Integer customerId, Customer updatedCustomer) {

        // Find the customer or return HTTP 404 if not found
        Customer existingCustomer = getCustomerById(customerId);

        // Make sure the updated name is not empty
        if (updatedCustomer.getName() == null ||
                updatedCustomer.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer name is required"
            );
        }

        // Make sure the updated email is not empty
        if (updatedCustomer.getEmail() == null ||
                updatedCustomer.getEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer email is required"
            );
        }

        // Prevent another customer from using the same email
        if (!existingCustomer.getEmail().equals(updatedCustomer.getEmail())
                && customerRepository.existsByEmail(updatedCustomer.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        // Update only the allowed fields
        existingCustomer.setName(updatedCustomer.getName());
        existingCustomer.setEmail(updatedCustomer.getEmail());
        existingCustomer.setPhone(updatedCustomer.getPhone());

        // Keep the original customer ID and hashed password unchanged

        // Save the updated information to MySQL
        return customerRepository.save(existingCustomer);
    }


    // DELETE: Delete an existing customer
    public void deleteCustomer(Integer customerId) {

        // Find the customer or return 404 if they don't exist
        Customer customer = getCustomerById(customerId);

        // Delete the customer from MySQL
        customerRepository.delete(customer);
    }



}
