package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.InterviewSession;
import com.careerpilot.model.User;
import com.careerpilot.repository.InterviewSessionRepository;
import com.careerpilot.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final AiService aiService;
    private final InterviewSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generate(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> req) {
        String type = (String) req.getOrDefault("type", "technical");
        int count = req.get("count") instanceof Integer ? (Integer) req.get("count") : 5;
        String role = (String) req.get("role");
        List<String> questions = aiService.generateInterviewQuestions(type, count, role);
        return ResponseEntity.ok(ApiResponse.success(Map.of("questions", questions, "type", type)));
    }

    @PostMapping("/{sessionId}/answer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitAnswer(
            @PathVariable String sessionId,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> req) {

        List<Map<String, String>> answers = (List<Map<String, String>>) req.get("answers");
        String type = (String) req.getOrDefault("type", "technical");
        Map<String, Object> feedback = aiService.analyzeInterviewAnswers(answers, type);

        try {
            InterviewSession session = InterviewSession.builder()
                    .user(user)
                    .type(type)
                    .answers(objectMapper.writeValueAsString(answers))
                    .overallScore(getInt(feedback, "overallScore", 75))
                    .technicalScore(getInt(feedback, "technicalScore", 75))
                    .communicationScore(getInt(feedback, "communicationScore", 75))
                    .confidenceScore(getInt(feedback, "confidenceScore", 75))
                    .clarityScore(getInt(feedback, "clarityScore", 75))
                    .strengths(objectMapper.writeValueAsString(feedback.getOrDefault("strengths", List.of())))
                    .improvements(objectMapper.writeValueAsString(feedback.getOrDefault("improvements", List.of())))
                    .aiFeedback((String) feedback.getOrDefault("detailedFeedback", ""))
                    .build();
            sessionRepository.save(session);
        } catch (Exception e) {
            // Don't fail the response if save fails
        }

        return ResponseEntity.ok(ApiResponse.success(feedback));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<InterviewSession>>> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                sessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InterviewSession>> getSession(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return sessionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .map(s -> ResponseEntity.ok(ApiResponse.success(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        sessionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .ifPresent(sessionRepository::delete);
        return ResponseEntity.ok(ApiResponse.success("Session deleted", null));
    }

    private int getInt(Map<String, Object> map, String key, int defaultVal) {
        Object val = map.get(key);
        if (val instanceof Integer) return (Integer) val;
        if (val instanceof Number) return ((Number) val).intValue();
        return defaultVal;
    }
}
