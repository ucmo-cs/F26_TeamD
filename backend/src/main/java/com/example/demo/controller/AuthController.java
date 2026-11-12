package com.example.demo.controller;

import com.example.demo.service.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Single login endpoint used by the frontend login form.
// The form has one "username" field: it is checked as an admin username first,
// then as a customer email.
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {

    private final LoginService loginService;

    public AuthController(LoginService loginService) {
        this.loginService = loginService;
    }

    // POST /api/auth/login  body: {"username": "...", "password": "..."}
    // 200: {"role": "admin" | "customer", "id": 1, "displayName": "..."}
    // 401: {"message": "Invalid username or password"}
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        var admin = loginService.authenticateAdmin(username, password);
        if (admin.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "role", "admin",
                    "id", admin.get().getAdminId(),
                    "displayName", admin.get().getUsername()));
        }

        var customer = loginService.authenticateCustomer(username, password);
        if (customer.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "role", "customer",
                    "id", customer.get().getCustomerId(),
                    "displayName", customer.get().getName()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid username or password"));
    }
}
