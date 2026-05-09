package com.careerpilot.service;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiService {

    @Value("${openai.api.key:}")
    private String openAiKey;

    @Value("${gemini.api.key:}")
    private String geminiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // ─── Primary entry point ────────────────────────────────────────────────────

    public String chat(String userMessage, String systemPrompt) {
        // Try Gemini first (free tier available)
        if (geminiKey != null && !geminiKey.isBlank()) {
            try { return callGemini(userMessage, systemPrompt); }
            catch (Exception e) { log.warn("Gemini failed, trying OpenAI: {}", e.getMessage()); }
        }
        // Fallback to OpenAI
        if (openAiKey != null && !openAiKey.isBlank()) {
            try { return callOpenAI(userMessage, systemPrompt); }
            catch (Exception e) { log.warn("OpenAI failed: {}", e.getMessage()); }
        }
        return getFallbackResponse(userMessage);
    }

    // ─── Gemini API ─────────────────────────────────────────────────────────────

    private String callGemini(String userMessage, String systemPrompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String combinedPrompt = systemPrompt + "\n\nUser: " + userMessage;

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", combinedPrompt))
            )),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 1500
            )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        return (String) parts.get(0).get("text");
    }

    // ─── OpenAI API ─────────────────────────────────────────────────────────────

    private String callOpenAI(String userMessage, String systemPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiKey);

        Map<String, Object> body = Map.of(
            "model", "gpt-4o-mini",
            "max_tokens", 1500,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://api.openai.com/v1/chat/completions", entity, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    // ─── Domain methods ─────────────────────────────────────────────────────────

    public List<String> generateInterviewQuestions(String type, int count, String role) {
        String prompt = String.format(
            "Generate exactly %d %s interview questions for a %s role. " +
            "Return ONLY a valid JSON array of strings, no markdown, no explanation. Example: [\"Q1\",\"Q2\"]",
            count, type, role != null ? role : "software engineering");
        String response = chat(prompt, "You are an expert technical interviewer. Return only valid JSON arrays.");
        try {
            return objectMapper.readValue(extractJsonArray(response), List.class);
        } catch (Exception e) {
            log.warn("Failed to parse interview questions JSON: {}", e.getMessage());
            return getDefaultQuestions(type);
        }
    }

    public Map<String, Object> analyzeInterviewAnswers(List<Map<String, String>> qa, String type) {
        String prompt = "Analyze these " + type + " interview Q&A pairs. " +
            "Return JSON with: overallScore (int 0-100), technicalScore (int), communicationScore (int), " +
            "confidenceScore (int), clarityScore (int), strengths (string array), improvements (string array), " +
            "detailedFeedback (string). Return ONLY valid JSON.";
        String response = chat(prompt + "\n\nQ&A:\n" + qa.toString(),
            "You are an expert interview coach. Return only valid JSON.");
        try {
            return objectMapper.readValue(extractJsonObject(response), Map.class);
        } catch (Exception e) {
            return buildDefaultFeedback();
        }
    }

    public Map<String, Object> analyzeResume(String resumeText) {
        String prompt = "Analyze this resume thoroughly. Return JSON with exactly these fields: " +
            "atsScore (int 0-100), overallScore (int 0-100), " +
            "sections (object: contact, summary, experience, skills, education, formatting — each int 0-100), " +
            "missingKeywords (string array), presentKeywords (string array), " +
            "suggestions (array of objects with 'type' (critical/warning/info) and 'text'), " +
            "topSkills (array of objects with 'skill' and 'value' int). Return ONLY valid JSON.";
        String response = chat(prompt + "\n\nResume:\n" + resumeText,
            "You are an expert ATS resume analyzer. Return only valid JSON.");
        try {
            return objectMapper.readValue(extractJsonObject(response), Map.class);
        } catch (Exception e) {
            return getDefaultResumeAnalysis();
        }
    }

    public String generateLinkedInPost(String topic, String context, String userName) {
        String prompt = String.format(
            "Write a professional LinkedIn post for %s about: %s. Context: %s. " +
            "Make it engaging, authentic, 150-300 words. Include 3-5 relevant hashtags at the end.",
            userName != null ? userName : "a tech professional", topic, context);
        return chat(prompt, "You are a professional LinkedIn content creator specializing in tech careers.");
    }

    public String generateRecruiterMessage(String context, String userName) {
        String prompt = "Write a professional, personalized recruiter outreach message for " +
            (userName != null ? userName : "a job seeker") + ". Context: " + context +
            ". Keep it under 150 words, specific, and compelling. Include a clear call to action.";
        return chat(prompt, "You are a career coach specializing in professional networking.");
    }

    public String generateEmail(String context, String userName) {
        String prompt = "Write a professional job application email for " +
            (userName != null ? userName : "a job seeker") + ". Context: " + context +
            ". Include: Subject line, greeting, 2-3 paragraph body, professional closing.";
        return chat(prompt, "You are a career coach specializing in professional communication.");
    }

    public Map<String, Object> generateRoadmap(String careerPath, String currentSkills) {
        String prompt = String.format(
            "Generate a detailed, realistic career roadmap for %s. " +
            "Current skills: %s. " +
            "Return JSON with: title (string), estimatedTime (string), progress (int 0), " +
            "phases (array of: id (int), title (string), duration (string), completed (bool false), " +
            "skills (array of: name (string), level (beginner/intermediate/advanced), completed (bool false))). " +
            "Include 4 phases with 4-6 skills each. Return ONLY valid JSON.",
            careerPath, currentSkills != null ? currentSkills : "general programming");
        String response = chat(prompt, "You are a career development expert. Return only valid JSON.");
        try {
            return objectMapper.readValue(extractJsonObject(response), Map.class);
        } catch (Exception e) {
            return getDefaultRoadmap(careerPath);
        }
    }

    public String careerChat(String message, String userContext) {
        String systemPrompt = "You are CareerPilot AI, an expert career advisor. " +
            "Help with resume tips, interview prep, job search strategies, salary negotiation, and career growth. " +
            "Be concise, actionable, and encouraging. " +
            (userContext != null ? "User context: " + userContext : "");
        return chat(message, systemPrompt);
    }

    public Map<String, Object> predictSalary(String skills, String location, String experience, String role) {
        String prompt = String.format(
            "Predict salary range for: Role=%s, Skills=%s, Location=%s, Experience=%s years. " +
            "Return JSON with: minSalary (int), maxSalary (int), medianSalary (int), currency (string), " +
            "marketDemand (low/medium/high), negotiationTips (string array), " +
            "topPayingCompanies (string array). Return ONLY valid JSON.",
            role, skills, location, experience);
        String response = chat(prompt, "You are a compensation expert. Return only valid JSON.");
        try {
            return objectMapper.readValue(extractJsonObject(response), Map.class);
        } catch (Exception e) {
            return Map.of("minSalary", 80000, "maxSalary", 140000, "medianSalary", 110000,
                "currency", "USD", "marketDemand", "high",
                "negotiationTips", List.of("Research market rates", "Highlight unique skills"),
                "topPayingCompanies", List.of("Google", "Meta", "Apple", "Microsoft"));
        }
    }

    public Map<String, Object> analyzeSkillGap(String resumeText, String jobDescription) {
        String prompt = "Compare this resume against the job description. " +
            "Return JSON with: matchScore (int 0-100), missingSkills (string array), " +
            "matchingSkills (string array), recommendations (string array), " +
            "estimatedLearningTime (string). Return ONLY valid JSON.\n\n" +
            "Resume:\n" + resumeText + "\n\nJob Description:\n" + jobDescription;
        String response = chat(prompt, "You are an expert career advisor. Return only valid JSON.");
        try {
            return objectMapper.readValue(extractJsonObject(response), Map.class);
        } catch (Exception e) {
            return Map.of("matchScore", 70, "missingSkills", List.of("TypeScript", "Docker"),
                "matchingSkills", List.of("React", "Node.js"), "recommendations", List.of("Learn TypeScript"),
                "estimatedLearningTime", "2-3 months");
        }
    }

    // ─── JSON extraction helpers ─────────────────────────────────────────────────

    private String extractJsonObject(String text) {
        if (text == null) return "{}";
        // Remove markdown code blocks
        text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) return text.substring(start, end + 1);
        return "{}";
    }

    private String extractJsonArray(String text) {
        if (text == null) return "[]";
        text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        int start = text.indexOf('[');
        int end = text.lastIndexOf(']');
        if (start != -1 && end != -1 && end > start) return text.substring(start, end + 1);
        return "[]";
    }

    // ─── Fallback responses ──────────────────────────────────────────────────────

    private String getFallbackResponse(String message) {
        if (message == null) return "How can I help with your career today?";
        String lower = message.toLowerCase();
        if (lower.contains("resume")) return "To improve your resume: 1) Quantify achievements with metrics (e.g., 'Increased performance by 40%'), 2) Use strong action verbs, 3) Tailor keywords to each job description, 4) Keep it to 1-2 pages, 5) Ensure ATS compatibility with clean formatting. Would you like me to analyze your resume?";
        if (lower.contains("interview")) return "For interview success: 1) Research the company thoroughly, 2) Practice STAR method for behavioral questions, 3) Prepare 5-7 strong examples from your experience, 4) Ask thoughtful questions about the role, 5) Follow up with a thank-you email within 24 hours.";
        if (lower.contains("salary")) return "For salary negotiation: 1) Research market rates on Glassdoor/Levels.fyi/LinkedIn, 2) Know your worth based on skills and experience, 3) Let them make the first offer when possible, 4) Negotiate the full package (equity, benefits, PTO), 5) Be confident and professional throughout.";
        if (lower.contains("linkedin")) return "To optimize your LinkedIn: 1) Use a professional headshot, 2) Write a compelling headline beyond just your title, 3) Craft a strong About section with keywords, 4) Get 3+ recommendations, 5) Post content regularly to increase visibility.";
        return "I'm your AI Career Assistant! I can help with resume optimization, interview preparation, job search strategies, salary negotiation, LinkedIn optimization, and career planning. What would you like to work on today?";
    }

    private List<String> getDefaultQuestions(String type) {
        return switch (type != null ? type.toLowerCase() : "technical") {
            case "behavioral" -> List.of(
                "Tell me about a time you had to deal with a difficult team member. How did you handle it?",
                "Describe a situation where you had to meet a very tight deadline. What was your approach?",
                "Give an example of when you showed leadership without having a formal leadership role.",
                "Tell me about your biggest professional failure and what you learned from it.",
                "How do you prioritize tasks when everything seems equally urgent?");
            case "hr" -> List.of(
                "Tell me about yourself and your career journey.",
                "Why do you want to work at this company specifically?",
                "Where do you see yourself in 5 years?",
                "What are your salary expectations for this role?",
                "Why are you looking to leave your current position?");
            case "system-design" -> List.of(
                "Design a URL shortener like bit.ly. Walk me through your architecture.",
                "How would you design Twitter's news feed system?",
                "Design a distributed cache system. What are the key considerations?",
                "How would you build a real-time notification system at scale?",
                "Design a ride-sharing application like Uber. Focus on the matching algorithm.");
            default -> List.of(
                "Explain the difference between var, let, and const in JavaScript.",
                "What is the time complexity of quicksort in the average and worst case?",
                "How would you implement a debounce function from scratch?",
                "Explain closures in JavaScript with a practical example.",
                "What are React hooks and why were they introduced? Give examples of useState and useEffect.");
        };
    }

    private Map<String, Object> buildDefaultFeedback() {
        return new HashMap<>(Map.of(
            "overallScore", 75, "technicalScore", 78, "communicationScore", 72,
            "confidenceScore", 70, "clarityScore", 76,
            "strengths", List.of("Good technical knowledge demonstrated", "Clear and structured communication", "Relevant examples provided"),
            "improvements", List.of("Add more specific metrics and numbers to answers", "Practice the STAR method for behavioral questions", "Work on conciseness — some answers were too long"),
            "detailedFeedback", "Overall a solid performance. Focus on quantifying your achievements and using the STAR method consistently."
        ));
    }

    private Map<String, Object> getDefaultResumeAnalysis() {
        Map<String, Object> result = new HashMap<>();
        result.put("atsScore", 78);
        result.put("overallScore", 74);
        result.put("sections", Map.of("contact", 90, "summary", 65, "experience", 80, "skills", 75, "education", 85, "formatting", 70));
        result.put("missingKeywords", List.of("TypeScript", "Docker", "Kubernetes", "GraphQL", "CI/CD"));
        result.put("presentKeywords", List.of("React", "Node.js", "Python", "SQL", "REST APIs", "Git"));
        result.put("suggestions", List.of(
            Map.of("type", "critical", "text", "Add quantifiable achievements to your experience section (e.g., 'Increased performance by 40%')"),
            Map.of("type", "critical", "text", "Include TypeScript — present in 78% of matched job descriptions"),
            Map.of("type", "warning", "text", "Your summary section is too generic. Tailor it to your target role."),
            Map.of("type", "info", "text", "Consider adding a projects section to showcase practical work")
        ));
        result.put("topSkills", List.of(
            Map.of("skill", "React", "value", 88),
            Map.of("skill", "Node.js", "value", 72),
            Map.of("skill", "Python", "value", 65),
            Map.of("skill", "SQL", "value", 80)
        ));
        return result;
    }

    private Map<String, Object> getDefaultRoadmap(String careerPath) {
        return Map.of(
            "title", careerPath != null ? careerPath : "Software Engineering",
            "estimatedTime", "8 months",
            "progress", 0,
            "phases", List.of(
                Map.of("id", 1, "title", "Foundation", "duration", "2 months", "completed", false,
                    "skills", List.of(
                        Map.of("name", "Core Programming Concepts", "level", "beginner", "completed", false),
                        Map.of("name", "Data Structures & Algorithms", "level", "beginner", "completed", false),
                        Map.of("name", "Version Control (Git)", "level", "beginner", "completed", false)
                    )),
                Map.of("id", 2, "title", "Core Skills", "duration", "3 months", "completed", false,
                    "skills", List.of(
                        Map.of("name", "Frontend Development", "level", "intermediate", "completed", false),
                        Map.of("name", "Backend Development", "level", "intermediate", "completed", false),
                        Map.of("name", "Database Design", "level", "intermediate", "completed", false)
                    )),
                Map.of("id", 3, "title", "Advanced Topics", "duration", "2 months", "completed", false,
                    "skills", List.of(
                        Map.of("name", "System Design", "level", "advanced", "completed", false),
                        Map.of("name", "Cloud & DevOps", "level", "advanced", "completed", false),
                        Map.of("name", "Performance Optimization", "level", "advanced", "completed", false)
                    )),
                Map.of("id", 4, "title", "Job Readiness", "duration", "1 month", "completed", false,
                    "skills", List.of(
                        Map.of("name", "Interview Preparation", "level", "advanced", "completed", false),
                        Map.of("name", "Portfolio Projects", "level", "advanced", "completed", false),
                        Map.of("name", "Networking & LinkedIn", "level", "intermediate", "completed", false)
                    ))
            )
        );
    }
}
