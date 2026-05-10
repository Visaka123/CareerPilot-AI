package com.careerpilot.service;

import com.careerpilot.model.Job;
import com.careerpilot.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Coordinates job applications across multiple platforms
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobApplicationCoordinator {

    private final List<JobApplicationPlatform> platforms;

    /**
     * Apply to a job using the appropriate platform
     */
    public JobApplicationPlatform.ApplicationResult applyToJob(Job job, User user) {
        log.info("Coordinating job application for job: {} on platform: {}", job.getId(), job.getSource());

        // Find the appropriate platform for this job
        JobApplicationPlatform platform = findPlatformForJob(job);

        if (platform == null) {
            log.warn("No suitable platform found for job: {}", job.getId());
            return new JobApplicationPlatform.ApplicationResult(false,
                "No suitable platform found for this job type",
                job.getApplyUrl());
        }

        log.info("Using platform: {} for job: {}", platform.getPlatformName(), job.getId());

        // Apply using the selected platform
        return platform.applyToJob(job, user);
    }

    /**
     * Find the appropriate platform for a job
     */
    private JobApplicationPlatform findPlatformForJob(Job job) {
        return platforms.stream()
                .filter(platform -> platform.canHandleJob(job))
                .findFirst()
                .orElse(null);
    }

    /**
     * Get all available platforms
     */
    public List<String> getAvailablePlatforms() {
        return platforms.stream()
                .map(JobApplicationPlatform::getPlatformName)
                .toList();
    }
}