
package com.example.demo.repository;

import com.example.demo.domain.PaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repository for accessing the payment_schedule table in MySQL
public interface PaymentScheduleRepository
        extends JpaRepository<PaymentSchedule, Integer> {

    // Find the payment schedule associated with a specific loan
    Optional<PaymentSchedule> findByLoan_LoanId(Integer loanId);
}
