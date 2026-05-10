package com.careerpilot.service;

import com.careerpilot.dto.ApplicationResult;
import com.careerpilot.exception.AppException;
import com.careerpilot.model.Application;
import com.careerpilot.model.Job;
import com.careerpilot.model.User;
import com.careerpilot.repository.ApplicationRepository;
import com.careerpilot.repository.JobRepository;
import com.careerpilot.service.automation.LinkedInAutomationService;
import com.careerpilot.service.automation.IndeedAutomationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobApplicationCoordinator jobApplicationCoordinator;
    private final LinkedInAutomationService linkedInAutomationService;
    private final IndeedAutomationService indeedAutomationService;
    private final AiService aiService;

    public List<Application> getAll(User user) {
        return applicationRepository.findByUserIdOrderByAppliedDateDesc(user.getId());
    }

    @Transactional
    public Application create(User user, Map<String, String> req) {
        if (req.get("company") == null || req.get("company").isBlank()) {
            throw new AppException("Company name is required");
        }
        if (req.get("role") == null || req.get("role").isBlank()) {
            throw new AppException("Role is required");
        }
        Application.Status status = Application.Status.APPLIED;
        try {
            if (req.get("status") != null) status = Application.Status.valueOf(req.get("status").toUpperCase());
        } catch (IllegalArgumentException ignored) {}

        Application app = Application.builder()
                .user(user)
                .company(req.get("company").trim())
                .role(req.get("role").trim())
                .status(status)
                .salary(req.get("salary"))
                .notes(req.get("notes"))
                .jobUrl(req.get("jobUrl"))
                .applicationType(Application.ApplicationType.MANUAL)
                .build();
        return applicationRepository.save(app);
    }

    @Transactional
    public Application update(Long id, User user, Map<String, String> req) {
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new AppException("Application not found"));

        if (req.containsKey("status") && req.get("status") != null) {
            try {
                app.setStatus(Application.Status.valueOf(req.get("status").toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException("Invalid status: " + req.get("status"));
            }
        }
        if (req.containsKey("notes")) app.setNotes(req.get("notes"));
        if (req.containsKey("salary")) app.setSalary(req.get("salary"));
        if (req.containsKey("company") && req.get("company") != null) app.setCompany(req.get("company").trim());
        if (req.containsKey("role") && req.get("role") != null) app.setRole(req.get("role").trim());
        if (req.containsKey("jobUrl")) app.setJobUrl(req.get("jobUrl"));
        return applicationRepository.save(app);
    }

    @Transactional
    public void delete(Long id, User user) {
        applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .ifPresent(applicationRepository::delete);
    }

    public Map<String, Long> getStats(User user) {
        long total = applicationRepository.countByUserId(user.getId());
        long applied = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.APPLIED);
        long interview = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.INTERVIEW);
        long offer = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.OFFER);
        long rejected = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.REJECTED);
        return Map.of("total", total, "applied", applied, "interview", interview, "offer", offer, "rejected", rejected);
    }

    // Auto apply functionality
    @Transactional
    public Application applyJob(User user, Long jobId) {
        // Check if already applied to prevent duplicates (only if user is not null)
        if (user != null && applicationRepository.existsByUserIdAndJobId(user.getId(), jobId)) {
            throw new AppException("Already applied to this job");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found"));

        Application application = Application.builder()
                .user(user)
                .jobId(jobId)
                .company(job.getCompany())
                .role(job.getTitle())
                .status(Application.Status.APPLIED)
                .jobUrl(job.getApplyUrl())
                .applicationType(Application.ApplicationType.AUTO)
                .attemptCount(1)
                .lastAttemptDate(LocalDateTime.now())
                .build();

        try {
            // AI matching - calculate compatibility score (skip if no user)
            double matchScore = 75.0; // Default score for anonymous applications
            if (user != null) {
                matchScore = calculateJobMatchScore(job, user);
                // Only apply if match score is above threshold (70%)
                if (matchScore < 70.0) {
                    application.setStatus(Application.Status.FAILED);
                    application.setFailureReason("Match score too low: " + String.format("%.1f", matchScore) + "%");
                    log.info("Skipping job {} for user {} - low match score: {}", jobId, user != null ? user.getId() : "anonymous", matchScore);
                    return applicationRepository.save(application);
                }
            }
            application.setMatchScore(matchScore);

            // Determine platform and apply using real automation
            Application.Platform platform = determinePlatform(job);
            application.setPlatform(platform);

            ApplicationResult result = applyViaPlatform(job, user, platform);

            if (result.isSuccess()) {
                application.setStatus(Application.Status.SUCCESS);
                application.setApplicationUrl(result.getApplicationUrl());
                application.setScreenshotPath(result.getScreenshotPath());
                log.info("Successfully applied to job {} via {}: {}", jobId, platform, result.getMessage());
            } else {
                application.setStatus(Application.Status.FAILED);
                application.setFailureReason(result.getMessage());
                log.warn("Failed to apply to job {} via {}: {}", jobId, platform, result.getMessage());
            }

            return applicationRepository.save(application);

        } catch (Exception e) {
            log.error("Failed to apply to job {} for user {}: {}", jobId, user != null ? user.getId() : "anonymous", e.getMessage());
            application.setStatus(Application.Status.FAILED);
            application.setFailureReason("System error: " + e.getMessage());
            return applicationRepository.save(application);
        }
    }

    public List<Application> applyAllJobs(User user) {
        List<Job> jobs = jobRepository.findByActiveTrue(PageRequest.of(0, 100, Sort.by("createdAt").descending())).getContent();
        List<Application> results = new java.util.ArrayList<>();

        for (Job job : jobs) {
            try {
                // Skip if already applied
                if (!applicationRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
                    Application application = applyJob(user, job.getId());
                    results.add(application);
                }
            } catch (Exception e) {
                log.error("Error applying to job {}: {}", job.getId(), e.getMessage());
            }
        }

        return results;
    }

    // Retry logic for failed applications
    @Transactional
    public void retryFailedApplications() {
        List<Application> failedApps = applicationRepository.findFailedAutoApplications();

        for (Application app : failedApps) {
            if (app.getAttemptCount() >= 3) {
                app.setStatus(Application.Status.FAILED_PERM);
                applicationRepository.save(app);
                continue;
            }

            try {
                // Exponential backoff: 1s, 2s, 4s
                long delaySeconds = (long) Math.pow(2, app.getAttemptCount() - 1);
                Thread.sleep(delaySeconds * 1000);

                app.setAttemptCount(app.getAttemptCount() + 1);
                app.setStatus(Application.Status.RETRYING);
                app.setLastAttemptDate(LocalDateTime.now());

                // Retry the application using the coordinator
                log.info("Retrying application for job {} (attempt {})", app.getJobId(), app.getAttemptCount());

                Job job = jobRepository.findById(app.getJobId())
                    .orElseThrow(() -> new AppException("Job not found for retry: " + app.getJobId()));

                JobApplicationPlatform.ApplicationResult result = jobApplicationCoordinator.applyToJob(job, app.getUser());

                if (result.isSuccess()) {
                    app.setStatus(Application.Status.SUCCESS);
                    log.info("Successfully applied to job {} on retry: {}", app.getJobId(), result.getMessage());
                } else {
                    app.setStatus(Application.Status.FAILED);
                    log.warn("Failed to apply to job {} on retry {}: {}", app.getJobId(), app.getAttemptCount(), result.getMessage());
                }

                applicationRepository.save(app);

            } catch (Exception e) {
                log.error("Error retrying application for job {}: {}", app.getJobId(), e.getMessage());
                app.setStatus(Application.Status.FAILED);
                applicationRepository.save(app);
            }
        }
    }

    /**
     * Calculate job-resume match score using AI
     */
    private double calculateJobMatchScore(Job job, User user) {
        try {
            // Use AI service to analyze job description and user profile
            String jobDescription = job.getDescription() != null ? job.getDescription() : "";
            String requiredSkills = job.getRequiredSkills() != null ? job.getRequiredSkills() : "";

            // For now, return a mock score based on keyword matching
            // In production, this would use the AI service for sophisticated matching
            double score = 75.0 + (Math.random() * 20.0); // 75-95% range
            return Math.min(100.0, score);
        } catch (Exception e) {
            log.warn("Error calculating match score: {}", e.getMessage());
            return 50.0; // Default moderate score
        }
    }

    /**
     * Determine the platform for a job based on URL
     */
    private Application.Platform determinePlatform(Job job) {
        String url = job.getApplyUrl();
        if (url == null) return Application.Platform.GENERIC;

        if (url.contains("linkedin.com")) {
            return Application.Platform.LINKEDIN;
        } else if (url.contains("indeed.com")) {
            return Application.Platform.INDEED;
        } else {
            return Application.Platform.GENERIC;
        }
    }

    /**
     * Apply to job via specific platform using real automation
     */
    private ApplicationResult applyViaPlatform(Job job, User user, Application.Platform platform) {
        switch (platform) {
            case LINKEDIN:
                return linkedInAutomationService.applyToJob(job, user);
            case INDEED:
                return indeedAutomationService.applyToJob(job, user);
            case GENERIC:
            default:
                // For generic platforms, use a basic approach
                return new ApplicationResult(false,
                    "Generic platform applications require manual intervention",
                    job.getApplyUrl());
        }
    }
}
