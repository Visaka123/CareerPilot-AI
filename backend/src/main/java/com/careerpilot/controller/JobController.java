package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.Job;
import com.careerpilot.model.SavedJob;
import com.careerpilot.model.User;
import com.careerpilot.repository.JobRepository;
import com.careerpilot.repository.SavedJobRepository;
import com.careerpilot.service.JobAggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    private final JobAggregationService jobAggregationService;

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
        // Return top 10 most recent jobs as recommendations
        PageRequest pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(jobRepository.findByActiveTrue(pageable).getContent()));
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
        savedJobRepository.deleteByUserIdAndJobId(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Job removed", null));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<Job>>> getSaved(@AuthenticationPrincipal User user) {
        List<Job> saved = savedJobRepository.findByUserId(user.getId())
                .stream().map(SavedJob::getJob).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sync(@AuthenticationPrincipal User user) {
        Map<String, Object> result = jobAggregationService.syncAll();
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
