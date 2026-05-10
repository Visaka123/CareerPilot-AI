package com.careerpilot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of a job application attempt
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResult {
    private boolean success;
    private String message;
    private String applicationUrl;
    private String screenshotPath;
    private Exception error;

    public ApplicationResult(boolean success, String message, String applicationUrl) {
        this.success = success;
        this.message = message;
        this.applicationUrl = applicationUrl;
    }

    public ApplicationResult(boolean success, String message, String applicationUrl, Exception error) {
        this.success = success;
        this.message = message;
        this.applicationUrl = applicationUrl;
        this.error = error;
    }
}