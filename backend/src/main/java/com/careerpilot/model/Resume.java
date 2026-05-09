package com.careerpilot.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String fileName;

    private String filePath;
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private Integer atsScore;
    private Integer overallScore;

    @Column(columnDefinition = "JSON")
    private String analysisResult;

    @Column(columnDefinition = "JSON")
    private String missingKeywords;

    @Column(columnDefinition = "JSON")
    private String presentKeywords;

    @Column(columnDefinition = "JSON")
    private String suggestions;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
