package com.careerpilot.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "scraped_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScrapedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String company;

    private String location;

    @Column(columnDefinition = "JSON")
    private String techStack; // Stored as JSON array string

    private String postingDate;

    @Column(columnDefinition = "TEXT")
    private String listingUrl;

    @Column(columnDefinition = "TEXT")
    private String productPageUrl;

    private String collectorId;

    @Column(columnDefinition = "TEXT")
    private String rawJobTitle;

    @Column(columnDefinition = "TEXT")
    private String rawCompany;

    @CreationTimestamp
    private LocalDateTime scrapedAt;
}
