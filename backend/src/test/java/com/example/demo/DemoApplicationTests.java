package com.example.demo;

import com.example.demo.domain.Customer;
import com.example.demo.domain.Loan;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.PaymentScheduleRepository;
import com.example.demo.service.CustomerService;
import com.example.demo.repository.LoanRepository;
import com.example.demo.service.LoanCalculator;
import com.example.demo.service.LoanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DemoApplicationTests {

    private CustomerRepository customerRepository;
    private CustomerService customerService;

    //pulls loan service and repository to the class
    private LoanRepository loanRepository;
    private LoanService loanService;

    @BeforeEach
    void setUp() {
        //Set up customer service and repository
        customerRepository = mock(CustomerRepository.class);
        customerService = new CustomerService(customerRepository);
        //Set up loan service and repository
        loanRepository = mock(LoanRepository.class);
        loanService = new LoanService(loanRepository, customerRepository, new LoanCalculator(), mock(PaymentScheduleRepository.class));
        when(customerRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(customerRepository.save(any(Customer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void acceptsValidUsername() {
        Customer customer = customer("Alice_123");

        assertDoesNotThrow(() -> customerService.createCustomer(customer));
    }

    @Test
    void rejectsUsernameWithWhitespace() {
        assertInvalidUsername("Alice Smith");
    }

    @Test
    void rejectsUsernameStartingWithNumber() {
        assertInvalidUsername("1Alice");
    }

    @Test
    void rejectsUsernameShorterThanFiveCharacters() {
        assertInvalidUsername("Ab_1");
    }

    @Test
    void rejectsUsernameLongerThanTwentyCharacters() {
        assertInvalidUsername("Abcdefghijklmnopqrstu");
    }

    //Caleb Test Case
    //Below is test case 1: Payment Field
    //Portal / Screen: Customer Page (Loan Payment Pop-up)
    //Input Under Test: Loan Payment Value
    //Rule: Value must be a whole number between or equal
    //to the minim payment and total value of the loan

    @Test void acceptsPaymentBetweenValidRange(){
        assertTestCaseValid(BigDecimal.valueOf(1000), 1);
    }

    @Test void acceptsMinPayment(){
        assertTestCaseValid(BigDecimal.valueOf(856.08), 1);

    }
    @Test void acceptsMaxPayment(){
        assertTestCaseValid(BigDecimal.valueOf(10000),1);
    }
    @Test void rejectValueUnderTheValidRange(){
        assertTestCaseInvalid(BigDecimal.valueOf(50), 1, "Payment must be above the minimum payment");
    }
    @Test void rejectValueOverTheValidRange(){
        assertTestCaseInvalid(BigDecimal.valueOf(1000000), 1, "Payment cannot be more than the remaining balance of $10000");
    }

    @Test void rejectNegativeInTheValidRange(){
        assertTestCaseInvalid(BigDecimal.valueOf(-200), 1, "Payment amount must be greater than zero");
    }


    private void assertInvalidUsername(String username) {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> customerService.createCustomer(customer(username)));

        assertEquals(400, exception.getStatusCode().value());
        assertEquals(
                "Username must be 5-20 characters, start with a letter, and contain only letters, numbers & underscores",
                exception.getReason());
    }

    private Customer customer(String username) {
        Customer customer = new Customer();
        customer.setName(username);
        customer.setEmail("alice@example.com");
        customer.setPassword("TestPass123!");
        return customer;
    }

    private Loan loanTestStart(BigDecimal loanValue)
    {
        Loan loan = new Loan();
        loan.setLoanId(1);
        loan.setRemainingBalance(loanValue);
        loan.setInterestRate(BigDecimal.valueOf(0.05));
        loan.setLoanTermMonths(12);
        when(loanRepository.findById(1)).thenReturn(Optional.of(loan));
        when(loanRepository.save(any(Loan.class))).thenAnswer(i->i.getArgument(0));
        return loan;
    }

    private void assertTestCaseValid(BigDecimal testValue, int loanID) {
        loanTestStart(new BigDecimal(10000));
        assertDoesNotThrow(() -> loanService.makePayment(loanID, testValue));
    }
    private void assertTestCaseInvalid(BigDecimal testValue, int loanID, String message) {
        loanTestStart(new BigDecimal(10000));
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> loanService.makePayment(loanID, testValue));
        assertEquals(400, exception.getStatusCode().value());
        assertEquals(
                message,
                exception.getReason());

    }
}
