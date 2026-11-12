package com.example.demo.controller;

import com.example.demo.domain.Customer;
import com.example.demo.domain.Loan;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.LoanRepository;
import com.example.demo.service.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final AdminService adminService;
    private final ObjectMapper objectMapper;

    public AdminController(
            LoanRepository loanRepository,
            CustomerRepository customerRepository,
            AdminService adminService,
            ObjectMapper objectMapper) {

        this.loanRepository = loanRepository;
        this.customerRepository = customerRepository;
        this.adminService = adminService;
        this.objectMapper = objectMapper;
    }

    // GET: View all unpaid loans
    @GetMapping("/unpaid-loans")
    public List<Loan> getUnpaidLoans() {

        return loanRepository.findAll().stream()
                .filter(loan -> loan.getRemainingBalance() != null
                        && loan.getRemainingBalance().signum() > 0)
                .toList();
    }

    // GET: View all customers
    @GetMapping("/customers")
    public List<Customer> getCustomers() {

        return customerRepository.findAll();
    }

    // POST: Create customer and loan automatically
    @PostMapping("/create-loan")
    public ResponseEntity<Loan> createCustomerAndLoan(
            @RequestBody Map<String, Object> request) {

        if (request.get("customer") == null ||
                request.get("loan") == null) {
            return ResponseEntity.badRequest().build();
        }

        Customer customer = objectMapper.convertValue(
                request.get("customer"), Customer.class);

        Loan loan = objectMapper.convertValue(
                request.get("loan"), Loan.class);

        Loan savedLoan =
                adminService.createCustomerAndLoan(customer, loan);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedLoan);
    }
}

