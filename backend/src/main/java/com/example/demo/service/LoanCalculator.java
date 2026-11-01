
package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;


@Service
public class LoanCalculator {

    // Calculate the minimum monthly loan payment
    public BigDecimal calculateMonthlyPayment(
            BigDecimal balance,
            BigDecimal annualInterestRate,
            int loanTermMonths) {

        // Convert BigDecimal values to double for calculation
        double principal = balance.doubleValue();
        double annualRate = annualInterestRate.doubleValue();

        // Validate the inputs
        if (principal <= 0 || annualRate < 0 || loanTermMonths <= 0) {
            throw new IllegalArgumentException(
                    "Invalid loan calculation values"
            );
        }

        // Convert annual interest rate to monthly interest rate
        double monthlyRate = annualRate / 12.0;

        double monthlyPayment;

        // If interest rate is 0%, divide the balance equally
        if (monthlyRate == 0) {
            monthlyPayment = principal / loanTermMonths;
        } else {

            // Standard Amortization Formula
            double factor = Math.pow(1 + monthlyRate, loanTermMonths);

            monthlyPayment = principal * monthlyRate * factor
                    / (factor - 1);
        }

        // Round the payment to 2 decimal places
        return BigDecimal.valueOf(monthlyPayment)
                .setScale(2, RoundingMode.HALF_UP);
    }


    public BigDecimal calculateMinimumPayment(
            BigDecimal balance,
            BigDecimal annualInterestRate,
            int remainingMonths,
            String frequency) {

        int paymentsPerYear;

        // Determine how many payments happen each year
        switch (frequency.toUpperCase()) {
            case "MONTHLY":
                paymentsPerYear = 12;
                break;

            case "BIWEEKLY":
                paymentsPerYear = 26;
                break;

            case "WEEKLY":
                paymentsPerYear = 52;
                break;

            default:
                throw new IllegalArgumentException(
                        "Invalid payment frequency"
                );
        }

        if (balance == null || annualInterestRate == null
                || balance.signum() <= 0
                || annualInterestRate.signum() < 0
                || remainingMonths <= 0) {
            throw new IllegalArgumentException("Invalid loan values");
        }

        // Interest rate for each payment period
        double rate = annualInterestRate.doubleValue()
                / paymentsPerYear;

        // Number of payments remaining
        int numberOfPayments = (int) Math.ceil(
                remainingMonths * paymentsPerYear / 12.0
        );

        double principal = balance.doubleValue();
        double payment;

        if (rate == 0) {
            payment = principal / numberOfPayments;
        } else {
            double factor = Math.pow(1 + rate, numberOfPayments);

            payment = principal * rate * factor
                    / (factor - 1);
        }

        // Round UP so the minimum is sufficient
        return BigDecimal.valueOf(payment)
                .setScale(2, RoundingMode.CEILING);
    }


    public int calculateRemainingMonths(
            LocalDate loanDate,
            int loanTermMonths) {

        if (loanDate == null || loanTermMonths <= 0) {
            throw new IllegalArgumentException("Invalid loan date or term");
        }

        LocalDate maturityDate = loanDate.plusMonths(loanTermMonths);
        LocalDate today = LocalDate.now();

        if (!maturityDate.isAfter(today)) {
            return 0;
        }

        return (int) Math.ceil(
                java.time.temporal.ChronoUnit.DAYS.between(
                        today, maturityDate
                ) / (365.2425 / 12.0)
        );
    }

    public LocalDate calculatePayoffDate(
            BigDecimal remainingBalance,
            BigDecimal annualInterestRate,
            BigDecimal paymentAmount,
            String frequency,
            LocalDate nextPaymentDate) {

        if (remainingBalance == null || annualInterestRate == null
                || paymentAmount == null || frequency == null
                || nextPaymentDate == null
                || remainingBalance.signum() <= 0
                || annualInterestRate.signum() < 0
                || paymentAmount.signum() <= 0) {
            throw new IllegalArgumentException("Invalid payoff calculation values");
        }

        int paymentsPerYear;

        switch (frequency) {
            case "MONTHLY":
                paymentsPerYear = 12;
                break;
            case "BIWEEKLY":
                paymentsPerYear = 26;
                break;
            case "WEEKLY":
                paymentsPerYear = 52;
                break;
            default:
                throw new IllegalArgumentException("Invalid payment frequency");
        }

        double balance = remainingBalance.doubleValue();
        double rate = annualInterestRate.doubleValue() / paymentsPerYear;
        double payment = paymentAmount.doubleValue();

        // Payment must cover interest so the balance can decrease
        if (rate > 0 && payment <= balance * rate) {
            throw new IllegalArgumentException(
                    "Payment is too low to pay off the loan"
            );
        }

        LocalDate paymentDate = nextPaymentDate;

        // Simulate future payments until the balance reaches zero
        for (int i = 0; i < 10000; i++) {

            // Add interest for one payment period
            balance = balance * (1 + rate);

            // Subtract the scheduled payment
            balance = balance - payment;

            if (balance <= 0.000001) {
                return paymentDate;
            }

            // Move to the next payment date
            switch (frequency) {
                case "MONTHLY":
                    paymentDate = paymentDate.plusMonths(1);
                    break;
                case "BIWEEKLY":
                    paymentDate = paymentDate.plusWeeks(2);
                    break;
                case "WEEKLY":
                    paymentDate = paymentDate.plusWeeks(1);
                    break;
            }
        }

        throw new IllegalArgumentException(
                "Unable to calculate payoff date"
        );
    }



}
