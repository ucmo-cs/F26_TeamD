
package com.example.demo.controller;

import com.example.demo.service.LoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/admin")
    public ResponseEntity<Map<String, String>> adminLogin(
            @RequestBody Map<String, String> request) {

        boolean success = loginService.loginAdmin(
                request.get("username"),
                request.get("password"));

        if (!success) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid admin credentials"));
        }

        return ResponseEntity.ok(
                Map.of("message", "Admin login successful", "role", "ADMIN"));
    }


    @PostMapping("/customer")
    public ResponseEntity<Map<String, Object>> customerLogin(
            @RequestBody Map<String, String> request) {

        Integer customerId = loginService.loginCustomer(
                request.get("email"),
                request.get("password"));

        if (customerId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid customer credentials"));
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "Customer login successful",
                        "role", "CUSTOMER",
                        "customerId", customerId
                ));
    }

}
