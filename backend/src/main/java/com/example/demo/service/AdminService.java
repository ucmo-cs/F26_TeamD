package com.example.demo.service;

import com.example.demo.domain.Customer;
import com.example.demo.domain.Loan;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
public class AdminService {

    private final CustomerService customerService;
    private final LoanService loanService;
    private final EmailService emailService;

    public AdminService(CustomerService customerService,
                        LoanService loanService,
                        EmailService emailService) {
        this.customerService = customerService;
        this.loanService = loanService;
        this.emailService = emailService;
    }

    @Transactional
    public Loan createCustomerAndLoan(Customer customer, Loan loan) {

        if (customer == null || loan == null) {
            throw new IllegalArgumentException(
                    "Customer and loan information are required");
        }

        // Generate a temporary password
        String temporaryPassword = generateTemporaryPassword();

        // CustomerService will hash this password before saving
        customer.setPassword(temporaryPassword);

        // Create the customer
        Customer savedCustomer = customerService.createCustomer(customer);

        // Create the loan for the new customer
        loan.setLoanId(null);
        loan.setCustomer(savedCustomer);
        Loan savedLoan = loanService.createLoan(loan);

        // Send login information to Mailtrap Sandbox
        emailService.sendWelcomeEmail(
                savedCustomer.getEmail(), temporaryPassword);

        return savedLoan;
    }

    private String generateTemporaryPassword() {
        String characters =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            password.append(
                    characters.charAt(random.nextInt(characters.length())));
        }

        return password.toString();
    }
}