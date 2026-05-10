package com.careerpilot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationRetryService {

    private final ApplicationService applicationService;

    // Run every 5 minutes to retry failed applications
    @Scheduled(fixedRate = 300000) // 5 minutes in milliseconds
    public void retryFailedApplications() {
        log.info("Starting scheduled retry of failed applications");
        try {
            applicationService.retryFailedApplications();
            log.info("Completed scheduled retry of failed applications");
        } catch (Exception e) {
            log.error("Error during scheduled retry of failed applications", e);
        }
    }
}