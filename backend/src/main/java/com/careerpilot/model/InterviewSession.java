package com.careerpilot.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type;

    @Column(columnDefinition = "JSON")
    private String questions;

    @Column(columnDefinition = "JSON")
    private String answers;

    private Integer overallScore;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer confidenceScore;
    private Integer clarityScore;

    @Column(columnDefinition = "JSON")
    private String strengths;

    @Column(columnDefinition = "JSON")
    private String improvements;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
