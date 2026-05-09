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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
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

    @CreationTimestamp
    private LocalDateTime appliedDate;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Status { APPLIED, INTERVIEW, OFFER, REJECTED, SAVED }
}
