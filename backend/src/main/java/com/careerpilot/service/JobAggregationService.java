package com.careerpilot.service;

import com.careerpilot.model.Job;
import com.careerpilot.repository.JobRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobAggregationService {

    private final JobRepository jobRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Sync every 6 hours automatically
    @Scheduled(fixedDelay = 6 * 60 * 60 * 1000, initialDelay = 30000)
    public void scheduledSync() {
        log.info("Starting scheduled job sync...");
        syncAll();
    }

    public Map<String, Object> syncAll() {
        int total = 0;
        List<String> sources = new ArrayList<>();

        // 1. RemoteOK (free, no auth required)
        try {
            int count = syncRemoteOK();
            total += count;
            sources.add("RemoteOK: " + count);
            log.info("RemoteOK sync: {} jobs", count);
        } catch (Exception e) {
            log.warn("RemoteOK sync failed: {}", e.getMessage());
        }

        // 2. Arbeitnow (free job board API)
        try {
            int count = syncArbeitnow();
            total += count;
            sources.add("Arbeitnow: " + count);
            log.info("Arbeitnow sync: {} jobs", count);
        } catch (Exception e) {
            log.warn("Arbeitnow sync failed: {}", e.getMessage());
        }

        // 3. Seed curated jobs if DB is empty
        if (jobRepository.count() == 0) {
            int count = seedCuratedJobs();
            total += count;
            sources.add("Curated: " + count);
        }

        return Map.of("synced", total, "sources", sources, "timestamp", LocalDateTime.now().toString());
    }

    private int syncRemoteOK() {
        String url = "https://remoteok.com/api";
        try {
            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
            if (response == null || response.isEmpty()) return 0;

            int count = 0;
            for (Map<String, Object> item : response) {
                if (item.get("id") == null || item.get("position") == null) continue;
                try {
                    String title = String.valueOf(item.getOrDefault("position", ""));
                    String company = String.valueOf(item.getOrDefault("company", "Unknown"));
                    if (title.isBlank() || company.isBlank()) continue;

                    // Check if already exists by title+company
                    boolean exists = jobRepository.existsByTitleAndCompany(title, company);
                    if (exists) continue;

                    List<String> tags = new ArrayList<>();
                    Object tagsObj = item.get("tags");
                    if (tagsObj instanceof List) tags = (List<String>) tagsObj;

                    Job job = Job.builder()
                        .title(title)
                        .company(company)
                        .location(String.valueOf(item.getOrDefault("location", "Remote")))
                        .type("Remote")
                        .description(stripHtml(String.valueOf(item.getOrDefault("description", ""))))
                        .requiredSkills(objectMapper.writeValueAsString(tags.stream().limit(8).toList()))
                        .applyUrl(String.valueOf(item.getOrDefault("url", "")))
                        .postedDate(formatPostedDate(item.get("date")))
                        .source("RemoteOK")
                        .active(true)
                        .build();
                    jobRepository.save(job);
                    count++;
                    if (count >= 50) break; // Limit per sync
                } catch (Exception e) {
                    log.debug("Skipping RemoteOK job: {}", e.getMessage());
                }
            }
            return count;
        } catch (Exception e) {
            log.warn("RemoteOK API error: {}", e.getMessage());
            return 0;
        }
    }

    private int syncArbeitnow() {
        String url = "https://www.arbeitnow.com/api/job-board-api?page=1";
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) return 0;

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getOrDefault("data", List.of());
            int count = 0;

            for (Map<String, Object> item : data) {
                try {
                    String title = String.valueOf(item.getOrDefault("title", ""));
                    String company = String.valueOf(item.getOrDefault("company_name", "Unknown"));
                    if (title.isBlank()) continue;

                    boolean exists = jobRepository.existsByTitleAndCompany(title, company);
                    if (exists) continue;

                    List<String> tags = new ArrayList<>();
                    Object tagsObj = item.get("tags");
                    if (tagsObj instanceof List) tags = (List<String>) tagsObj;

                    Job job = Job.builder()
                        .title(title)
                        .company(company)
                        .location(String.valueOf(item.getOrDefault("location", "Remote")))
                        .type(Boolean.TRUE.equals(item.get("remote")) ? "Remote" : "On-site")
                        .description(stripHtml(String.valueOf(item.getOrDefault("description", ""))))
                        .requiredSkills(objectMapper.writeValueAsString(tags.stream().limit(8).toList()))
                        .applyUrl(String.valueOf(item.getOrDefault("url", "")))
                        .postedDate("Recently")
                        .source("Arbeitnow")
                        .active(true)
                        .build();
                    jobRepository.save(job);
                    count++;
                    if (count >= 30) break;
                } catch (Exception e) {
                    log.debug("Skipping Arbeitnow job: {}", e.getMessage());
                }
            }
            return count;
        } catch (Exception e) {
            log.warn("Arbeitnow API error: {}", e.getMessage());
            return 0;
        }
    }

    public int seedCuratedJobs() {
        List<Job> curated = List.of(
            buildJob("Senior Frontend Engineer", "Stripe", "San Francisco, CA", "Full-time",
                "$160K - $220K", "Build the next generation of payment interfaces used by millions worldwide. Work with React, TypeScript, and GraphQL.",
                List.of("React", "TypeScript", "GraphQL", "CSS", "Node.js"), "Senior", "2d ago", "https://stripe.com/jobs"),
            buildJob("Full Stack Developer", "Airbnb", "Remote", "Full-time",
                "$140K - $190K", "Join our platform team to build scalable features for hosts and guests globally.",
                List.of("React", "Node.js", "PostgreSQL", "Redis", "AWS"), "Mid", "3d ago", "https://careers.airbnb.com"),
            buildJob("Software Engineer II", "Notion", "New York, NY", "Full-time",
                "$130K - $175K", "Help us build the connected workspace for the world. Work on core editor features.",
                List.of("React", "Python", "AWS", "TypeScript", "PostgreSQL"), "Mid", "5d ago", "https://notion.so/careers"),
            buildJob("Frontend Engineer", "Linear", "Remote", "Full-time",
                "$120K - $160K", "Build beautiful, fast interfaces for the best project management tool.",
                List.of("React", "TypeScript", "CSS", "Figma", "GraphQL"), "Mid", "1w ago", "https://linear.app/careers"),
            buildJob("React Developer", "Vercel", "Remote", "Full-time",
                "$110K - $150K", "Work on the platform that powers the modern web. Build Next.js tooling.",
                List.of("React", "Next.js", "TypeScript", "Node.js", "AWS"), "Mid", "1w ago", "https://vercel.com/careers"),
            buildJob("Staff Engineer", "Figma", "San Francisco, CA", "Full-time",
                "$200K - $280K", "Lead technical direction for Figma's core editor experience.",
                List.of("React", "WebGL", "TypeScript", "C++", "Rust"), "Staff", "2w ago", "https://figma.com/careers"),
            buildJob("Backend Engineer", "Shopify", "Remote", "Full-time",
                "$130K - $180K", "Build and scale the commerce platform powering millions of merchants.",
                List.of("Ruby", "Go", "MySQL", "Redis", "Kafka"), "Mid", "3d ago", "https://shopify.com/careers"),
            buildJob("Data Engineer", "Databricks", "San Francisco, CA", "Full-time",
                "$150K - $210K", "Build data pipelines and infrastructure for the world's leading data platform.",
                List.of("Python", "Spark", "SQL", "Scala", "AWS"), "Senior", "4d ago", "https://databricks.com/careers"),
            buildJob("DevOps Engineer", "HashiCorp", "Remote", "Full-time",
                "$140K - $190K", "Build and maintain infrastructure tooling used by thousands of companies.",
                List.of("Terraform", "Kubernetes", "Go", "AWS", "Docker"), "Senior", "5d ago", "https://hashicorp.com/careers"),
            buildJob("ML Engineer", "Hugging Face", "Remote", "Full-time",
                "$160K - $220K", "Work on cutting-edge machine learning models and infrastructure.",
                List.of("Python", "PyTorch", "Transformers", "CUDA", "Docker"), "Senior", "1w ago", "https://huggingface.co/jobs"),
            buildJob("iOS Developer", "Duolingo", "Pittsburgh, PA", "Full-time",
                "$120K - $170K", "Build the world's most popular language learning app for iOS.",
                List.of("Swift", "SwiftUI", "Objective-C", "Xcode", "CoreData"), "Mid", "1w ago", "https://duolingo.com/careers"),
            buildJob("Android Developer", "Spotify", "New York, NY", "Full-time",
                "$130K - $180K", "Build the Android app used by 600M+ music lovers worldwide.",
                List.of("Kotlin", "Android", "Jetpack Compose", "Coroutines", "MVVM"), "Senior", "2w ago", "https://spotify.com/careers"),
            buildJob("Security Engineer", "Cloudflare", "Remote", "Full-time",
                "$150K - $200K", "Protect the internet. Work on security infrastructure at massive scale.",
                List.of("Go", "Rust", "Linux", "Networking", "Cryptography"), "Senior", "3d ago", "https://cloudflare.com/careers"),
            buildJob("Product Engineer", "Loom", "Remote", "Full-time",
                "$120K - $165K", "Build the future of async video communication.",
                List.of("React", "TypeScript", "Node.js", "WebRTC", "AWS"), "Mid", "4d ago", "https://loom.com/careers"),
            buildJob("Software Engineer Intern", "Google", "Mountain View, CA", "Internship",
                "$8K - $10K/month", "Work on Google-scale engineering problems across various teams.",
                List.of("Python", "Java", "C++", "Algorithms", "Data Structures"), "Entry Level", "1w ago", "https://careers.google.com")
        );

        int count = 0;
        for (Job job : curated) {
            if (!jobRepository.existsByTitleAndCompany(job.getTitle(), job.getCompany())) {
                jobRepository.save(job);
                count++;
            }
        }
        return count;
    }

    private Job buildJob(String title, String company, String location, String type,
                         String salary, String description, List<String> skills,
                         String experience, String posted, String applyUrl) {
        try {
            return Job.builder()
                .title(title).company(company).location(location).type(type)
                .salaryRange(salary).description(description)
                .requiredSkills(objectMapper.writeValueAsString(skills))
                .experienceLevel(experience).postedDate(posted).applyUrl(applyUrl)
                .source("CareerPilot").active(true).build();
        } catch (Exception e) {
            return Job.builder().title(title).company(company).active(true).build();
        }
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        String stripped = html.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
        return stripped.length() > 1000 ? stripped.substring(0, 1000) + "..." : stripped;
    }

    private String formatPostedDate(Object dateObj) {
        if (dateObj == null) return "Recently";
        String date = String.valueOf(dateObj);
        if (date.length() >= 10) {
            try {
                LocalDateTime posted = LocalDateTime.parse(date.substring(0, 10) + "T00:00:00");
                long days = java.time.temporal.ChronoUnit.DAYS.between(posted, LocalDateTime.now());
                if (days == 0) return "Today";
                if (days == 1) return "1d ago";
                if (days < 7) return days + "d ago";
                if (days < 30) return (days / 7) + "w ago";
                return (days / 30) + "mo ago";
            } catch (Exception ignored) {}
        }
        return "Recently";
    }
}
