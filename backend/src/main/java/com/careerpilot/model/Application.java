package com.careerpilot.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.APPLIED;

    private String salary;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String jobUrl;

    // Auto apply tracking fields
    private Long jobId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationType applicationType = ApplicationType.MANUAL;

    @Builder.Default
    private int attemptCount = 0;

    private LocalDateTime lastAttemptDate;

    // New fields for real automation
    @Enumerated(EnumType.STRING)
    private Platform platform;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @Column(columnDefinition = "TEXT")
    private String applicationUrl;

    @Builder.Default
    private Double matchScore = 0.0;

    @Column(columnDefinition = "TEXT")
    private String screenshotPath;

    @CreationTimestamp
    private LocalDateTime appliedDate;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Status { APPLIED, INTERVIEW, OFFER, REJECTED, SAVED, FAILED, RETRYING, SUCCESS, FAILED_PERM }

    public enum ApplicationType { MANUAL, AUTO }

    public enum Platform { LINKEDIN, INDEED, GENERIC }
}
