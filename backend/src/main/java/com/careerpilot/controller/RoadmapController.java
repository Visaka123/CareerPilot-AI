package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.CareerRoadmap;
import com.careerpilot.model.User;
import com.careerpilot.repository.CareerRoadmapRepository;
import com.careerpilot.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final AiService aiService;
    private final CareerRoadmapRepository roadmapRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generate(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> req) {

        Map<String, Object> roadmap = aiService.generateRoadmap(
                req.getOrDefault("careerPath", "Full Stack Development"),
                req.getOrDefault("currentSkills", "Java, React")
        );

        try {
            CareerRoadmap entity = CareerRoadmap.builder()
                    .user(user)
                    .title((String) roadmap.getOrDefault("title", "Career Roadmap"))
                    .careerPath(req.getOrDefault("careerPath", "Full Stack Development"))
                    .estimatedTime((String) roadmap.getOrDefault("estimatedTime", "6 months"))
                    .phases(objectMapper.writeValueAsString(roadmap.get("phases")))
                    .build();

            roadmapRepository.save(entity);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.ok(ApiResponse.success(roadmap));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CareerRoadmap>>> getAll(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        roadmapRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                )
        );
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<CareerRoadmap>> updateProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> req) {

        return roadmapRepository.findById(id)
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(user.getId()))
                .map(r -> {
                    Object progressObj = req.get("progress");
                    int progress = progressObj != null
                            ? Integer.parseInt(progressObj.toString())
                            : r.getProgress();

                    r.setProgress(progress);

                    return ResponseEntity.ok(
                            ApiResponse.success(roadmapRepository.save(r))
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }
}