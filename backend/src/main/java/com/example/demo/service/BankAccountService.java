package com.example.demo.service;

import com.example.demo.domain.BankAccount;
import com.example.demo.repository.BankAccountRepository;
import com.example.demo.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final CustomerRepository customerRepository;

    public BankAccountService(
            BankAccountRepository bankAccountRepository,
            CustomerRepository customerRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.customerRepository = customerRepository;
    }

    // Get a customer's bank account
    public BankAccount getBankAccount(Integer customerId) {
        return bankAccountRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Bank account not found"));
    }

    // Add or update a customer's bank account
    public BankAccount saveBankAccount(Integer customerId, BankAccount details) {

        var customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found"));

        if (details == null
                || details.getBankName() == null
                || details.getBankName().isBlank()
                || details.getRoutingNumber() == null
                || !details.getRoutingNumber().matches("\\d{9}")
                || details.getAccountNumber() == null
                || !details.getAccountNumber().matches("\\d{4,17}")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid bank account details");
        }

        BankAccount account = bankAccountRepository
                .findByCustomerCustomerId(customerId)
                .orElseGet(BankAccount::new);

        account.setCustomer(customer);
        account.setBankName(details.getBankName());
        account.setRoutingNumber(details.getRoutingNumber());
        account.setAccountNumber(details.getAccountNumber());

        return bankAccountRepository.save(account);
    }
}