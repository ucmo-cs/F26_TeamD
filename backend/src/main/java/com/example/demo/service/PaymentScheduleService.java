
package com.example.demo.service;

import com.example.demo.domain.Loan;
import com.example.demo.domain.PaymentSchedule;
import com.example.demo.repository.LoanRepository;
import com.example.demo.repository.PaymentScheduleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class PaymentScheduleService {

    private final PaymentScheduleRepository paymentScheduleRepository;
    private final LoanRepository loanRepository;

    // Constructor
    public PaymentScheduleService(
            PaymentScheduleRepository paymentScheduleRepository,
            LoanRepository loanRepository) {

        this.paymentScheduleRepository = paymentScheduleRepository;
        this.loanRepository = loanRepository;
    }

    // GET: Find a payment schedule using the loan ID
    public PaymentSchedule getScheduleByLoanId(Integer loanId) {

        return paymentScheduleRepository.findByLoan_LoanId(loanId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment schedule not found"
                ));
    }

    // POST: Create a new payment schedule
    public PaymentSchedule createSchedule(PaymentSchedule schedule) {

        // Make sure a loan ID was provided
        if (schedule.getLoan() == null ||
                schedule.getLoan().getLoanId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Loan ID is required"
            );
        }

        Integer loanId = schedule.getLoan().getLoanId();

        // Check whether the loan exists
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Loan not found"
                ));

        // Prevent duplicate payment schedules
        if (paymentScheduleRepository.findByLoan_LoanId(loanId).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payment schedule already exists for this loan"
            );
        }

        // Validate payment frequency
        String frequency = schedule.getFrequency();

        if (frequency == null ||
                (!frequency.equals("MONTHLY") &&
                        !frequency.equals("BIWEEKLY") &&
                        !frequency.equals("WEEKLY"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Frequency must be MONTHLY, BIWEEKLY, or WEEKLY"
            );
        }

        // Payment amount must be positive
        if (schedule.getPaymentAmount() == null ||
                schedule.getPaymentAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount must be greater than zero"
            );
        }

        // Require a next payment date
        if (schedule.getNextPaymentDate() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Next payment date is required"
            );
        }

        // Link the schedule to the existing loan
        schedule.setLoan(loan);
        schedule.setScheduleId(null);

        // Save the schedule to MySQL
        return paymentScheduleRepository.save(schedule);
    }


    // PUT: Update an existing payment schedule
    public PaymentSchedule updateSchedule(
            Integer loanId, PaymentSchedule updatedSchedule) {

        // Find the existing schedule
        PaymentSchedule existingSchedule = getScheduleByLoanId(loanId);

        // Validate payment frequency
        String frequency = updatedSchedule.getFrequency();

        if (frequency == null ||
                (!frequency.equals("MONTHLY") &&
                        !frequency.equals("BIWEEKLY") &&
                        !frequency.equals("WEEKLY"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Frequency must be MONTHLY, BIWEEKLY, or WEEKLY"
            );
        }

        // Validate payment amount
        if (updatedSchedule.getPaymentAmount() == null ||
                updatedSchedule.getPaymentAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount must be greater than zero"
            );
        }

        // Validate next payment date
        if (updatedSchedule.getNextPaymentDate() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Next payment date is required"
            );
        }

        // Update the existing schedule
        existingSchedule.setFrequency(frequency);
        existingSchedule.setPaymentAmount(
                updatedSchedule.getPaymentAmount());
        existingSchedule.setNextPaymentDate(
                updatedSchedule.getNextPaymentDate());

        // Save changes to MySQL
        return paymentScheduleRepository.save(existingSchedule);
    }

}
