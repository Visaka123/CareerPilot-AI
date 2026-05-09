package com.careerpilot.repository;

import com.careerpilot.model.CareerRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CareerRoadmapRepository extends JpaRepository<CareerRoadmap, Long> {
    List<CareerRoadmap> findByUserIdOrderByCreatedAtDesc(Long userId);
}

