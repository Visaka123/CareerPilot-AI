package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.ScrapedJob;
import com.careerpilot.service.ScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scraper")
@RequiredArgsConstructor
public class ScraperController {

    private final ScraperService scraperService;

    @PostMapping("/trigger")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerScraper(
            @RequestParam(required = false) String collectorId,
            @RequestParam(required = false) String url) {
        Map<String, Object> result = scraperService.triggerScraper(collectorId, url);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<ScrapedJob>>> getScrapedJobs(
            @RequestParam(required = false) String query) {
        List<ScrapedJob> jobs = scraperService.getScrapedJobs(query);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/status/{collectorId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus(
            @PathVariable String collectorId) {
        Map<String, Object> status = scraperService.getStatus(collectorId);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @GetMapping("/analytics/skills")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSkillDemand() {
        List<Map<String, Object>> skills = scraperService.getSkillDemand();
        return ResponseEntity.ok(ApiResponse.success(skills));
    }
}
