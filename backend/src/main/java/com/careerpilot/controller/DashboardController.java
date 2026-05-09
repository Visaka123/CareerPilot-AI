package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.User;
import com.careerpilot.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats(user)));
    }

    @GetMapping("/weekly-chart")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWeeklyChart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getWeeklyChart(user)));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getActivity(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getActivity(user)));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecommendations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRecommendations(user)));
    }
}
