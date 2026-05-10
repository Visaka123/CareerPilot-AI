package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.Job;
import com.careerpilot.model.SavedJob;
import com.careerpilot.model.User;
import com.careerpilot.repository.JobRepository;
import com.careerpilot.repository.SavedJobRepository;
import com.careerpilot.repository.ResumeRepository;
import com.careerpilot.service.JobAggregationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final ResumeRepository resumeRepository;
    private final JobAggregationService jobAggregationService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Job>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String experience,
            @AuthenticationPrincipal User user) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Job> jobs;
        if (type != null || experience != null) {
            jobs = jobRepository.findWithFilters(type, experience, pageable);
        } else {
            jobs = jobRepository.findByActiveTrue(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Job>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(jobRepository.searchJobs(q, pageable)));
    }

    @GetMapping("/recommended")
    public ResponseEntity<ApiResponse<List<Job>>> getRecommended(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }

        // Get user's latest resume
        List<com.careerpilot.model.Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (resumes.isEmpty()) {
            // Fallback to recent jobs if no resume
            PageRequest pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
            return ResponseEntity.ok(ApiResponse.success(jobRepository.findByActiveTrue(pageable).getContent()));
        }

        com.careerpilot.model.Resume latestResume = resumes.get(0);

        // Extract user skills from resume
        Set<String> userSkills = extractUserSkills(latestResume);

        // Get all active jobs
        List<Job> allJobs = jobRepository.findAll().stream()
            .filter(Job::isActive)
            .collect(Collectors.toList());

        // Calculate match scores and sort
        List<Job> recommendedJobs = allJobs.stream()
            .map(job -> {
                double matchScore = calculateMatchScore(job, userSkills);
                job.setMatchScore(matchScore); // Assuming Job has setMatchScore method
                return job;
            })
            .filter(job -> job.getMatchScore() >= 30.0) // Only show jobs with decent match
            .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
            .limit(20)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(recommendedJobs));
    }

    private Set<String> extractUserSkills(com.careerpilot.model.Resume resume) {
        Set<String> skills = new java.util.HashSet<>();

        // Try to get skills from presentKeywords JSON
        if (resume.getPresentKeywords() != null) {
            try {
                List<String> keywords = objectMapper.readValue(resume.getPresentKeywords(),
                    new TypeReference<List<String>>() {});
                skills.addAll(keywords);
            } catch (Exception e) {
                // Fallback to text analysis
            }
        }

        // Fallback: extract skills from extractedText
        if (skills.isEmpty() && resume.getExtractedText() != null) {
            String text = resume.getExtractedText().toLowerCase();
            // Common tech skills to look for
            String[] commonSkills = {
                "java", "python", "javascript", "react", "angular", "vue", "node", "spring",
                "sql", "mysql", "postgresql", "mongodb", "aws", "docker", "kubernetes",
                "git", "linux", "agile", "scrum", "html", "css", "typescript"
            };
            for (String skill : commonSkills) {
                if (text.contains(skill)) {
                    skills.add(skill);
                }
            }
        }

        return skills;
    }

    private double calculateMatchScore(Job job, Set<String> userSkills) {
        if (userSkills.isEmpty()) return 50.0; // Default score

        try {
            // Parse job skills
            Set<String> jobSkills = new java.util.HashSet<>();
            if (job.getRequiredSkills() != null) {
                List<String> skills = objectMapper.readValue(job.getRequiredSkills(),
                    new TypeReference<List<String>>() {});
                jobSkills.addAll(skills.stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList()));
            }

            // Calculate match percentage
            long matchingSkills = userSkills.stream()
                .map(String::toLowerCase)
                .filter(jobSkills::contains)
                .count();

            if (jobSkills.isEmpty()) return 60.0; // Default if no skills specified

            double matchPercentage = (double) matchingSkills / jobSkills.size() * 100.0;

            // Boost score for exact title matches or related experience
            String jobTitle = job.getTitle().toLowerCase();
            String jobDesc = job.getDescription() != null ? job.getDescription().toLowerCase() : "";

            for (String skill : userSkills) {
                if (jobTitle.contains(skill) || jobDesc.contains(skill)) {
                    matchPercentage += 10;
                }
            }

            return Math.min(100.0, matchPercentage);

        } catch (Exception e) {
            return 50.0; // Default score on error
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> getById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(j -> ResponseEntity.ok(ApiResponse.success(j)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> save(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        if (!savedJobRepository.existsByUserIdAndJobId(user.getId(), id)) {
            jobRepository.findById(id).ifPresent(job -> {
                SavedJob saved = SavedJob.builder().user(user).job(job).build();
                savedJobRepository.save(saved);
            });
        }
        return ResponseEntity.ok(ApiResponse.success("Job saved", null));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> unsave(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        savedJobRepository.deleteByUserIdAndJobId(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Job removed", null));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<Job>>> getSaved(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        List<Job> saved = savedJobRepository.findByUserIdWithJob(user.getId())
                .stream().map(SavedJob::getJob).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sync(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }
        Map<String, Object> result = jobAggregationService.syncAll();
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
