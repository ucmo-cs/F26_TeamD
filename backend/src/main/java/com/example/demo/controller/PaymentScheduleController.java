
package com.example.demo.controller;

import com.example.demo.domain.PaymentSchedule;
import com.example.demo.service.PaymentScheduleService;
import org.springframework.web.bind.annotation.*;

// Handles HTTP requests for payment schedules
@RestController
@RequestMapping("/api/payment-schedules")
public class PaymentScheduleController {

    private final PaymentScheduleService paymentScheduleService;

    // Spring Boot automatically injects the service
    public PaymentScheduleController(
            PaymentScheduleService paymentScheduleService) {

        this.paymentScheduleService = paymentScheduleService;
    }

    // GET: Retrieve a payment schedule using its loan ID
    @GetMapping("/loan/{loanId}")
    public PaymentSchedule getScheduleByLoanId(
            @PathVariable Integer loanId) {

        return paymentScheduleService.getScheduleByLoanId(loanId);
    }

    // POST: Create a new payment schedule
    @PostMapping
    public PaymentSchedule createSchedule(
            @RequestBody PaymentSchedule schedule) {

        return paymentScheduleService.createSchedule(schedule);
    }


    // PUT: Update a payment schedule using its loan ID
    @PutMapping("/loan/{loanId}")
    public PaymentSchedule updateSchedule(
            @PathVariable Integer loanId,
            @RequestBody PaymentSchedule updatedSchedule) {

        return paymentScheduleService.updateSchedule(
                loanId, updatedSchedule);
    }


}
