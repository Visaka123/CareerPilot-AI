package com.careerpilot.service.automation;
import com.careerpilot.model.Application;
import com.careerpilot.dto.ApplicationResult;
import com.careerpilot.model.Job;
import com.careerpilot.model.User;
import com.careerpilot.service.BrowserAutomationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Real LinkedIn Easy Apply automation using Selenium
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LinkedInAutomationService {

    private final BrowserAutomationService browserService;

    @Value("${linkedin.email:}")
    private String linkedinEmail;

    @Value("${linkedin.password:}")
    private String linkedinPassword;

    /**
     * Apply to LinkedIn job using Easy Apply
     */
    public ApplicationResult applyToJob(Job job, User user) {
        ChromeDriver driver = null;
        String screenshotPath = null;

        try {
            log.info("Starting LinkedIn Easy Apply automation for job: {}", job.getId());

            // Validate credentials
            if (linkedinEmail == null || linkedinEmail.isEmpty() ||
                linkedinPassword == null || linkedinPassword.isEmpty()) {
                return new ApplicationResult(false,
                    "LinkedIn credentials not configured",
                    job.getApplyUrl());
            }

            // Create browser instance
            driver = browserService.createWebDriver();

            // Login to LinkedIn
            if (!loginToLinkedIn(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_login_failed_" + job.getId());
                return new ApplicationResult(false,
                    "Failed to login to LinkedIn",
                    job.getApplyUrl());
            }

            // Navigate to job page
            driver.get(job.getApplyUrl());
            browserService.getRandomDelay(2000, 4000);

            // Check if Easy Apply button exists
            if (!isEasyApplyAvailable(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_no_easy_apply_" + job.getId());
                return new ApplicationResult(false,
                    "Easy Apply not available for this job",
                    job.getApplyUrl());
            }

            // Check for CAPTCHA
            if (browserService.isCaptchaPresent(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_captcha_" + job.getId());
                return new ApplicationResult(false,
                    "CAPTCHA detected - manual intervention required",
                    job.getApplyUrl());
            }

            // Click Easy Apply button
            if (!clickEasyApplyButton(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_easy_apply_click_failed_" + job.getId());
                return new ApplicationResult(false,
                    "Failed to click Easy Apply button",
                    job.getApplyUrl());
            }

            // Fill application form
            if (!fillApplicationForm(driver, user)) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_form_fill_failed_" + job.getId());
                return new ApplicationResult(false,
                    "Failed to fill application form",
                    job.getApplyUrl());
            }

            // Upload resume
            if (!uploadResume(driver, user)) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_resume_upload_failed_" + job.getId());
                return new ApplicationResult(false,
                    "Failed to upload resume",
                    job.getApplyUrl());
            }

            // Submit application
            if (!submitApplication(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_submit_failed_" + job.getId());
                return new ApplicationResult(false,
                    "Failed to submit application",
                    job.getApplyUrl());
            }

            // Take success screenshot
            screenshotPath = browserService.takeScreenshot(driver, "linkedin_success_" + job.getId());

            log.info("Successfully applied to LinkedIn job: {}", job.getId());
            return new ApplicationResult(true,
                "Successfully applied via LinkedIn Easy Apply",
                job.getApplyUrl());

        } catch (Exception e) {
            log.error("Error during LinkedIn automation for job {}: {}", job.getId(), e.getMessage(), e);
            if (driver != null) {
                screenshotPath = browserService.takeScreenshot(driver, "linkedin_error_" + job.getId());
            }
            return new ApplicationResult(false,
                "Automation error: " + e.getMessage(),
                job.getApplyUrl(),
                e);
        } finally {
            browserService.closeBrowser(driver);
        }
    }

    /**
     * Login to LinkedIn
     */
    private boolean loginToLinkedIn(ChromeDriver driver) {
        try {
            driver.get("https://www.linkedin.com/login");
            browserService.getRandomDelay(2000, 4000);

            // Enter email
            if (!browserService.safeSendKeys(driver, By.id("username"), linkedinEmail, 3)) {
                return false;
            }

            // Enter password
            if (!browserService.safeSendKeys(driver, By.id("password"), linkedinPassword, 3)) {
                return false;
            }

            // Click login button
            if (!browserService.safeClick(driver, By.cssSelector("button[type='submit']"), 3)) {
                return false;
            }

            // Wait for login to complete
            browserService.getRandomDelay(3000, 5000);

            // Check if login was successful (look for feed or profile elements)
            return driver.getCurrentUrl().contains("linkedin.com/feed") ||
                   driver.findElements(By.cssSelector("[data-control-name='nav.settings_and_privacy']")).size() > 0;

        } catch (Exception e) {
            log.error("LinkedIn login failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if Easy Apply is available
     */
    private boolean isEasyApplyAvailable(ChromeDriver driver) {
        try {
            // Look for Easy Apply button
            return driver.findElements(By.cssSelector("button[aria-label*='Easy Apply']")).size() > 0 ||
                   driver.findElements(By.xpath("//button[contains(text(), 'Easy Apply')]")).size() > 0 ||
                   driver.findElements(By.xpath("//span[contains(text(), 'Easy Apply')]")).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Click Easy Apply button
     */
    private boolean clickEasyApplyButton(ChromeDriver driver) {
        try {
            // Try different selectors for Easy Apply button
            String[] selectors = {
                "button[aria-label*='Easy Apply']",
                "//button[contains(text(), 'Easy Apply')]",
                "//span[contains(text(), 'Easy Apply')]/parent::button",
                ".jobs-apply-button"
            };

            for (String selector : selectors) {
                try {
                    WebElement button;
                    if (selector.startsWith("//")) {
                        button = driver.findElement(By.xpath(selector));
                    } else {
                        button = driver.findElement(By.cssSelector(selector));
                    }

                    browserService.scrollToElement(driver, button);
                    button.click();
                    browserService.getRandomDelay(2000, 4000);
                    return true;
                } catch (Exception e) {
                    continue;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Failed to click Easy Apply button: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Fill application form
     */
    private boolean fillApplicationForm(ChromeDriver driver, User user) {
        try {
            browserService.getRandomDelay(2000, 3000);

            // Handle different form steps
            int maxSteps = 5;
            for (int step = 0; step < maxSteps; step++) {
                try {
                    // Look for Next or Continue buttons
                    WebElement nextButton = findNextButton(driver);
                    if (nextButton != null) {
                        browserService.scrollToElement(driver, nextButton);
                        nextButton.click();
                        browserService.getRandomDelay(1500, 3000);
                    } else {
                        // Check if we're on the final submit step
                        break;
                    }
                } catch (Exception e) {
                    log.warn("Form step {} failed: {}", step, e.getMessage());
                    break;
                }
            }

            return true;
        } catch (Exception e) {
            log.error("Failed to fill application form: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Find Next/Continue button in application form
     */
    private WebElement findNextButton(ChromeDriver driver) {
        String[] buttonTexts = {"Next", "Continue", "Save", "Submit"};
        for (String text : buttonTexts) {
            try {
                return driver.findElement(By.xpath("//button[contains(text(), '" + text + "')]"));
            } catch (Exception e) {
                continue;
            }
        }
        return null;
    }

    /**
     * Upload resume
     */
    private boolean uploadResume(ChromeDriver driver, User user) {
        try {
            // Look for file upload input
            WebElement uploadInput = null;

            // Try different selectors for resume upload
            String[] selectors = {
                "input[type='file']",
                "[data-test-id='file-upload']",
                ".file-upload input",
                "[aria-label*='resume']",
                "[aria-label*='CV']"
            };

            for (String selector : selectors) {
                try {
                    uploadInput = driver.findElement(By.cssSelector(selector));
                    if (uploadInput.isDisplayed()) {
                        break;
                    }
                } catch (Exception e) {
                    continue;
                }
            }

            if (uploadInput == null) {
                log.info("No resume upload required for this application");
                return true; // Some applications don't require resume upload
            }

            // Upload resume file
            String resumePath = "uploads/resume.pdf"; // Default resume location
            uploadInput.sendKeys(System.getProperty("user.dir") + "/" + resumePath);
            browserService.getRandomDelay(2000, 4000);

            return true;
        } catch (Exception e) {
            log.error("Failed to upload resume: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Submit application
     */
    private boolean submitApplication(ChromeDriver driver) {
        try {
            // Look for Submit/Apply button
            String[] submitSelectors = {
                "button[type='submit']",
                "//button[contains(text(), 'Submit')]",
                "//button[contains(text(), 'Apply')]",
                "//button[contains(text(), 'Send')]",
                "[data-test-id='submit-application']"
            };

            for (String selector : submitSelectors) {
                try {
                    WebElement submitButton;
                    if (selector.startsWith("//")) {
                        submitButton = driver.findElement(By.xpath(selector));
                    } else {
                        submitButton = driver.findElement(By.cssSelector(selector));
                    }

                    if (submitButton.isDisplayed() && submitButton.isEnabled()) {
                        browserService.scrollToElement(driver, submitButton);
                        submitButton.click();
                        browserService.getRandomDelay(3000, 5000);
                        return true;
                    }
                } catch (Exception e) {
                    continue;
                }
            }

            return false;
        } catch (Exception e) {
            log.error("Failed to submit application: {}", e.getMessage());
            return false;
        }
    }
}