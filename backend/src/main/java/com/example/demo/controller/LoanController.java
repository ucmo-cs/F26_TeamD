
package com.example.demo.controller;

import com.example.demo.domain.Loan;
import com.example.demo.service.LoanService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// Handles incoming HTTP requests
@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    // Spring provides LoanService automatically
    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    // GET: Retrieve all loans
    @GetMapping
    public List<Loan> getAllLoans() {
        return loanService.getAllLoans();
    }

    // GET: Retrieve one loan by ID
    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoanById(@PathVariable Integer id) {
        return loanService.getLoanById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: Create a new loan
    @PostMapping
    public ResponseEntity<Loan> createLoan(@RequestBody Loan loan) {
        Loan savedLoan = loanService.createLoan(loan);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedLoan);
    }

    // PUT: Update a loan's remaining balance
    // Example URL: /api/loans/1/balance
    @PutMapping("/{id}/balance")
    public Loan updateLoanBalance(
            @PathVariable Integer id,
            @RequestBody Map<String, BigDecimal> request) {

        // Read remainingBalance from the JSON request
        BigDecimal newBalance = request.get("remainingBalance");

        // Ask the service to update the database
        return loanService.updateLoanBalance(id, newBalance);
    }
}
