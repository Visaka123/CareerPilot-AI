package com.careerpilot.controller;

import com.careerpilot.dto.ApiResponse;
import com.careerpilot.model.Notification;
import com.careerpilot.model.User;
import com.careerpilot.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .ifPresent(n -> { n.setRead(true); notificationRepository.save(n); });
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal User user) {
        notificationRepository.markAllReadByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}
