package com.example.demo.repository;

import com.example.demo.domain.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BankAccountRepository
        extends JpaRepository<BankAccount, Integer> {

    Optional<BankAccount> findByCustomerCustomerId(Integer customerId);
}