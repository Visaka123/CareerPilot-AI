package com.careerpilot.service;

import com.careerpilot.exception.AppException;
import com.careerpilot.model.Application;
import com.careerpilot.model.User;
import com.careerpilot.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public List<Application> getAll(User user) {
        return applicationRepository.findByUserIdOrderByAppliedDateDesc(user.getId());
    }

    @Transactional
    public Application create(User user, Map<String, String> req) {
        if (req.get("company") == null || req.get("company").isBlank()) {
            throw new AppException("Company name is required");
        }
        if (req.get("role") == null || req.get("role").isBlank()) {
            throw new AppException("Role is required");
        }
        Application.Status status = Application.Status.APPLIED;
        try {
            if (req.get("status") != null) status = Application.Status.valueOf(req.get("status").toUpperCase());
        } catch (IllegalArgumentException ignored) {}

        Application app = Application.builder()
                .user(user)
                .company(req.get("company").trim())
                .role(req.get("role").trim())
                .status(status)
                .salary(req.get("salary"))
                .notes(req.get("notes"))
                .jobUrl(req.get("jobUrl"))
                .build();
        return applicationRepository.save(app);
    }

    @Transactional
    public Application update(Long id, User user, Map<String, String> req) {
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new AppException("Application not found"));

        if (req.containsKey("status") && req.get("status") != null) {
            try {
                app.setStatus(Application.Status.valueOf(req.get("status").toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException("Invalid status: " + req.get("status"));
            }
        }
        if (req.containsKey("notes")) app.setNotes(req.get("notes"));
        if (req.containsKey("salary")) app.setSalary(req.get("salary"));
        if (req.containsKey("company") && req.get("company") != null) app.setCompany(req.get("company").trim());
        if (req.containsKey("role") && req.get("role") != null) app.setRole(req.get("role").trim());
        if (req.containsKey("jobUrl")) app.setJobUrl(req.get("jobUrl"));
        return applicationRepository.save(app);
    }

    @Transactional
    public void delete(Long id, User user) {
        applicationRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .ifPresent(applicationRepository::delete);
    }

    public Map<String, Long> getStats(User user) {
        long total = applicationRepository.countByUserId(user.getId());
        long applied = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.APPLIED);
        long interview = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.INTERVIEW);
        long offer = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.OFFER);
        long rejected = applicationRepository.countByUserIdAndStatus(user.getId(), Application.Status.REJECTED);
        return Map.of("total", total, "applied", applied, "interview", interview, "offer", offer, "rejected", rejected);
    }
}
