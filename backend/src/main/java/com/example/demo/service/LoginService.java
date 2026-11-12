
package com.example.demo.service;

import com.example.demo.domain.Admin;
import com.example.demo.domain.Customer;
import com.example.demo.repository.AdminRepository;
import com.example.demo.repository.CustomerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LoginService {

    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public LoginService(AdminRepository adminRepository,
                        CustomerRepository customerRepository) {
        this.adminRepository = adminRepository;
        this.customerRepository = customerRepository;
    }

    // Admin login (demo only)
    public boolean loginAdmin(String username, String password) {

        if (username == null || password == null) {
            return false;
        }

        Admin admin = adminRepository.findByUsername(username)
                .orElse(null);

        return admin != null
                && password.equals(admin.getPassword());
    }

    // Customer login using BCrypt

    public Integer loginCustomer(String email, String password) {

        if (email == null || password == null) {
            return null;
        }

        Customer customer = customerRepository.findByEmail(email)
                .orElse(null);

        if (customer == null ||
                !passwordEncoder.matches(password, customer.getPassword())) {
            return null;
        }

        return customer.getCustomerId();
    }

    // Used by /api/auth/login: returns the matching admin, or empty
    public Optional<Admin> authenticateAdmin(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }
        return adminRepository.findByUsername(username)
                .filter(admin -> password.equals(admin.getPassword()));
    }

    // Used by /api/auth/login: returns the matching customer, or empty
    public Optional<Customer> authenticateCustomer(String email, String password) {
        if (email == null || password == null) {
            return Optional.empty();
        }
        return customerRepository.findByEmail(email)
                .filter(customer -> passwordEncoder.matches(password, customer.getPassword()));
    }

}
