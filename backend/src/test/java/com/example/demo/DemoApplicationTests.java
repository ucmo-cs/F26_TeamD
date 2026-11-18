package com.example.demo;

import com.example.demo.domain.Customer;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DemoApplicationTests {

    private CustomerRepository customerRepository;
    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        customerRepository = mock(CustomerRepository.class);
        customerService = new CustomerService(customerRepository);
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
}
