package com.careerpilot.service;

import com.careerpilot.model.Job;
import com.careerpilot.model.User;

/**
 * Interface for job application platforms (LinkedIn, Indeed, Glassdoor, etc.)
 */
public interface JobApplicationPlatform {

    /**
     * Get the platform name (e.g., "LINKEDIN", "INDEED")
     */
    String getPlatformName();

    /**
     * Check if this platform can handle the given job URL
     */
    boolean canHandleJob(Job job);

    /**
     * Apply to a job on this platform
     * @return ApplicationResult with success/failure status and details
     */
    ApplicationResult applyToJob(Job job, User user);

    /**
     * Result of a job application attempt
     */
    class ApplicationResult {
        private final boolean success;
        private final String message;
        private final String applicationUrl;
        private final Exception error;

        public ApplicationResult(boolean success, String message, String applicationUrl) {
            this(success, message, applicationUrl, null);
        }

        public ApplicationResult(boolean success, String message, String applicationUrl, Exception error) {
            this.success = success;
            this.message = message;
            this.applicationUrl = applicationUrl;
            this.error = error;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getApplicationUrl() { return applicationUrl; }
        public Exception getError() { return error; }
    }
}