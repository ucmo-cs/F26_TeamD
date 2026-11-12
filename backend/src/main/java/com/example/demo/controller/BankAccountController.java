package com.example.demo.controller;

import com.example.demo.domain.BankAccount;
import com.example.demo.service.BankAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bank-accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class BankAccountController {

    private final BankAccountService bankAccountService;

    public BankAccountController(BankAccountService bankAccountService) {
        this.bankAccountService = bankAccountService;
    }

    // Get customer's bank account
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<BankAccount> getBankAccount(
            @PathVariable Integer customerId) {

        return ResponseEntity.ok(
                bankAccountService.getBankAccount(customerId));
    }

    // Add or update customer's bank account
    @PutMapping("/customer/{customerId}")
    public ResponseEntity<BankAccount> saveBankAccount(
            @PathVariable Integer customerId,
            @RequestBody BankAccount details) {

        return ResponseEntity.ok(
                bankAccountService.saveBankAccount(customerId, details));
    }
}