-- Local test data for development. Run AFTER database-setup.sql.
-- Safe to re-run: it clears the tables first.
--
-- Test logins:
--   Admin:     username "admin"               password "Admin1234!"
--   Customer:  email "jane.doe@example.com"  password "Test1234!"
--   Customer:  email "sam.lee@example.com"   password "Test1234!"
-- Customer passwords are stored as BCrypt hashes (LoginService checks with BCrypt).
-- The admin password is plain text because LoginService.loginAdmin compares it directly.

USE loan_repayment_tracker;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payment_schedule;
TRUNCATE TABLE bank_account;
TRUNCATE TABLE loan;
TRUNCATE TABLE admin;
TRUNCATE TABLE customers;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO admin (Admin_id, username, password) VALUES
  (1, 'admin', 'Admin1234!');

INSERT INTO customers (customer_id, name, email, phone, password) VALUES
  (1, 'Jane Doe', 'jane.doe@example.com', '816-555-0101',
   '$2a$10$It6Jt54qCSwBYmDd8VQLzemoWv9Iu0aO4.heOIobpNE64H1vZ4oHO'),
  (2, 'Sam Lee',  'sam.lee@example.com',  NULL,
   '$2a$10$It6Jt54qCSwBYmDd8VQLzemoWv9Iu0aO4.heOIobpNE64H1vZ4oHO');

INSERT INTO loan (loan_id, customer_id, loan_date, original_amount, remaining_balance, interest_rate, loan_term_months) VALUES
  (1, 1, '2025-01-15', 20000.00, 15250.00, 0.0650, 60),
  (2, 1, '2026-03-01',  5000.00,  4800.00, 0.0000, 24),
  (3, 2, '2024-06-10', 12000.00,  6000.00, 0.0425, 36),
  (4, 2, '2023-02-01',  3000.00,     0.00, 0.0500, 12);  -- fully paid, should be hidden

INSERT INTO payment_schedule (schedule_id, loan_id, frequency, payment_amount, next_payment_date) VALUES
  (1, 1, 'MONTHLY',  391.32, '2026-12-01'),
  (2, 3, 'BIWEEKLY', 165.00, '2026-11-20');
-- loan 2 intentionally has no schedule, so it shows as "unscheduled"

INSERT INTO bank_account (account_id, customer_id, bank_name, routing_number, account_number) VALUES
  (1, 1, 'Test Bank', '000000000', '0000001234');
