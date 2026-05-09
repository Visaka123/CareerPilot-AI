package com.careerpilot.service;

import com.careerpilot.model.Application;
import com.careerpilot.model.User;
import com.careerpilot.repository.ApplicationRepository;
import com.careerpilot.repository.InterviewSessionRepository;
import com.careerpilot.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final InterviewSessionRepository interviewSessionRepository;

    public Map<String, Object> getStats(User user) {
        long totalApps = applicationRepository.countByUserId(user.getId());
        long interviewCount = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.INTERVIEW);
        long offerCount = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.OFFER);
        long totalInterviewSessions = interviewSessionRepository.countByUserId(user.getId());
        long resumeCount = resumeRepository.countByUserId(user.getId());

        // Career score: weighted formula based on activity
        int careerScore = calculateCareerScore(totalApps, interviewCount, offerCount, totalInterviewSessions, resumeCount, user);

        // ATS score: from latest resume analysis
        Integer atsScore = resumeRepository.findLatestAtsScoreByUserId(user.getId()).orElse(null);

        Map<String, Object> stats = new HashMap<>();
        stats.put("careerScore", careerScore);
        stats.put("applications", totalApps);
        stats.put("interviews", totalInterviewSessions);
        stats.put("atsScore", atsScore);
        stats.put("offers", offerCount);
        stats.put("resumeCount", resumeCount);
        stats.put("profileComplete", calculateProfileCompletion(user));
        return stats;
    }

    public List<Map<String, Object>> getWeeklyChart(User user) {
        List<Map<String, Object>> chart = new ArrayList<>();
        LocalDate today = LocalDate.now();
        // Get start of current week (Monday)
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);

        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for (int i = 0; i < 7; i++) {
            LocalDate day = weekStart.plusDays(i);
            LocalDateTime start = day.atStartOfDay();
            LocalDateTime end = day.plusDays(1).atStartOfDay();

            long apps = applicationRepository.countByUserIdAndAppliedDateBetween(user.getId(), start, end);
            long interviews = interviewSessionRepository.countByUserIdAndCreatedAtBetween(user.getId(), start, end);

            Map<String, Object> point = new HashMap<>();
            point.put("day", days[i]);
            point.put("applications", apps);
            point.put("interviews", interviews);
            chart.add(point);
        }
        return chart;
    }

    public List<Map<String, Object>> getActivity(User user) {
        List<Map<String, Object>> activity = new ArrayList<>();

        // Recent applications
        applicationRepository.findTop5ByUserIdOrderByAppliedDateDesc(user.getId()).forEach(app -> {
            Map<String, Object> item = new HashMap<>();
            item.put("type", "application");
            item.put("text", "Applied to " + app.getRole() + " at " + app.getCompany());
            item.put("createdAt", app.getAppliedDate());
            item.put("status", app.getStatus().name().toLowerCase());
            activity.add(item);
        });

        // Recent interview sessions
        interviewSessionRepository.findTop3ByUserIdOrderByCreatedAtDesc(user.getId()).forEach(session -> {
            Map<String, Object> item = new HashMap<>();
            item.put("type", "interview");
            item.put("text", "Completed " + session.getType() + " mock interview — Score: " + session.getOverallScore() + "/100");
            item.put("createdAt", session.getCreatedAt());
            item.put("status", "interview");
            activity.add(item);
        });

        // Sort by date descending
        activity.sort((a, b) -> {
            LocalDateTime da = (LocalDateTime) a.get("createdAt");
            LocalDateTime db = (LocalDateTime) b.get("createdAt");
            if (da == null || db == null) return 0;
            return db.compareTo(da);
        });

        return activity.stream().limit(8).toList();
    }

    public List<Map<String, Object>> getRecommendations(User user) {
        List<Map<String, Object>> recs = new ArrayList<>();

        long apps = applicationRepository.countByUserId(user.getId());
        long resumes = resumeRepository.countByUserId(user.getId());
        long interviews = interviewSessionRepository.countByUserId(user.getId());
        int profileComplete = calculateProfileCompletion(user);

        if (resumes == 0) {
            recs.add(Map.of("text", "Upload and analyze your resume to get an ATS score and personalized improvements", "priority", "high"));
        }
        if (apps == 0) {
            recs.add(Map.of("text", "Start applying to jobs — your first application is the hardest step!", "priority", "high"));
        }
        if (interviews == 0) {
            recs.add(Map.of("text", "Practice with a mock interview to build confidence before real interviews", "priority", "medium"));
        }
        if (profileComplete < 70) {
            recs.add(Map.of("text", "Complete your profile (currently " + profileComplete + "%) to get better job matches", "priority", "medium"));
        }
        if (user.getLinkedin() == null || user.getLinkedin().isBlank()) {
            recs.add(Map.of("text", "Add your LinkedIn profile URL to improve your professional visibility", "priority", "low"));
        }
        if (apps > 0 && apps < 5) {
            recs.add(Map.of("text", "Apply to more jobs — experts recommend applying to 10-15 positions per week", "priority", "medium"));
        }
        if (recs.isEmpty()) {
            recs.add(Map.of("text", "Great progress! Keep applying consistently and practicing interviews", "priority", "low"));
            recs.add(Map.of("text", "Generate a career roadmap to track your skill development goals", "priority", "low"));
        }

        return recs;
    }

    private int calculateCareerScore(long apps, long interviews, long offers, long sessions, long resumes, User user) {
        int score = 30; // Base score
        score += Math.min(apps * 3, 20);       // Up to 20 pts for applications
        score += Math.min(interviews * 5, 15); // Up to 15 pts for interviews
        score += Math.min(offers * 10, 20);    // Up to 20 pts for offers
        score += Math.min(sessions * 2, 10);   // Up to 10 pts for mock interviews
        score += resumes > 0 ? 5 : 0;          // 5 pts for having a resume
        score += calculateProfileCompletion(user) / 20; // Up to 5 pts for profile
        return Math.min(score, 100);
    }

    private int calculateProfileCompletion(User user) {
        int fields = 0, filled = 0;
        String[] checks = {user.getName(), user.getEmail(), user.getTitle(), user.getLocation(), user.getBio(), user.getLinkedin(), user.getGithub()};
        for (String f : checks) {
            fields++;
            if (f != null && !f.isBlank()) filled++;
        }
        return (int) ((filled * 100.0) / fields);
    }
}
