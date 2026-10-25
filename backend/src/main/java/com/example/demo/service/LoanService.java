
package com.example.demo.service;


import com.example.demo.domain.Customer;
import com.example.demo.domain.Loan;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.LoanRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class LoanService {

    // Repositories communicate with MySQL
    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;

    // Spring automatically provides both repositories
    public LoanService(LoanRepository loanRepository,
                       CustomerRepository customerRepository) {
        this.loanRepository = loanRepository;
        this.customerRepository = customerRepository;
    }

    // GET: Retrieve all loans
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    // GET: Retrieve one loan by ID
    public Optional<Loan> getLoanById(Integer id) {
        return loanRepository.findById(id);
    }

    // POST: Create a loan for an existing customer
    public Loan createLoan(Loan loan) {

        // Check that the request contains loan information
        if (loan == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Loan information is required"
            );
        }

        // Check that the customer ID was provided
        if (loan.getCustomer() == null ||
                loan.getCustomer().getCustomerId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer ID is required"
            );
        }

        // Check that the original loan amount is valid
        if (loan.getOriginalAmount() == null ||
                loan.getOriginalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Original loan amount must be greater than zero"
            );
        }

        // Check that the remaining balance is valid
        if (loan.getRemainingBalance() == null ||
                loan.getRemainingBalance().compareTo(BigDecimal.ZERO) < 0 ||
                loan.getRemainingBalance().compareTo(loan.getOriginalAmount()) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Remaining balance must be between zero and the original amount"
            );
        }

        // Check that the interest rate is valid
        if (loan.getInterestRate() == null ||
                loan.getInterestRate().compareTo(BigDecimal.ZERO) < 0 ||
                loan.getInterestRate().compareTo(BigDecimal.ONE) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Interest rate must be between 0 and 1"
            );
        }

        // Check that the loan date was provided
        if (loan.getLoanDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Loan date is required"
            );
        }

        // Find the existing customer
        Integer customerId = loan.getCustomer().getCustomerId();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));

        // Connect the loan to that customer
        loan.setCustomer(customer);

        // Save the loan in MySQL
        return loanRepository.save(loan);
    }

    // PUT: Update the remaining balance of a loan
    // This is for local testing, not real payment processing
    public Loan updateLoanBalance(Integer id, BigDecimal newBalance) {

        // Find the existing loan
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Loan not found"
                ));

        // Reject negative balances
        if (newBalance == null ||
                newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Balance must be zero or greater"
            );
        }

        // Change the remaining balance
        loan.setRemainingBalance(newBalance);

        // Save the updated loan in MySQL
        return loanRepository.save(loan);
    }
}
