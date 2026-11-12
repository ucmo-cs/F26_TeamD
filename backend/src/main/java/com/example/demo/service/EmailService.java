
package com.example.demo.service;

import io.mailtrap.client.MailtrapClient;
import io.mailtrap.config.MailtrapConfig;
import io.mailtrap.factory.MailtrapClientFactory;
import io.mailtrap.model.request.emails.Address;
import io.mailtrap.model.request.emails.MailtrapMail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private final MailtrapClient client;
    private final String fromEmail;

    public EmailService(
            @Value("${mailtrap.api-token}") String token,
            @Value("${mailtrap.inbox-id}") long inboxId,
            @Value("${mailtrap.sandbox}") boolean sandbox,
            @Value("${mailtrap.from-email}") String fromEmail) {

        this.fromEmail = fromEmail;

        MailtrapConfig config = new MailtrapConfig.Builder()
                .token(token)
                .sandbox(sandbox)
                .inboxId(inboxId)
                .build();

        this.client =
                MailtrapClientFactory.createMailtrapClient(config);
    }

    public void sendWelcomeEmail(
            String customerEmail, String temporaryPassword) {

        MailtrapMail mail = MailtrapMail.builder()
                .from(new Address(fromEmail, "Commerce Bank"))
                .to(List.of(new Address(customerEmail)))
                .subject("Your Commerce Bank Login Details")
                .text("Welcome to Commerce Bank!\n\n"
                        + "Email: " + customerEmail + "\n"
                        + "Temporary Password: " + temporaryPassword
                        + "\n\nPlease change your password after login.")
                .build();

        client.send(mail);
    }
}
