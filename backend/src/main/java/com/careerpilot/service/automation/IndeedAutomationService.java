package com.careerpilot.service.automation;

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

/**
 * Real Indeed job application automation using Selenium
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IndeedAutomationService {

    private final BrowserAutomationService browserService;

    @Value("${indeed.email:}")
    private String indeedEmail;

    @Value("${indeed.password:}")
    private String indeedPassword;

    /**
     * Apply to Indeed job
     */
    public ApplicationResult applyToJob(Job job, User user) {
        ChromeDriver driver = null;
        String screenshotPath = null;

        try {
            log.info("Starting Indeed application automation for job: {}", job.getId());

            // Validate credentials
            if (indeedEmail == null || indeedEmail.isEmpty()) {
                return new ApplicationResult(false,
                    "Indeed credentials not configured",
                    job.getApplyUrl());
            }

            // Create browser instance
            driver = browserService.createWebDriver();

            // Navigate to job page
            driver.get(job.getApplyUrl());
            browserService.getRandomDelay(2000, 4000);

            // Check if application is possible
            if (!isApplicationAvailable(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "indeed_no_apply_" + job.getId());
                return new ApplicationResult(false,
                    "Application not available for this Indeed job",
                    job.getApplyUrl());
            }

            // Check for CAPTCHA
            if (browserService.isCaptchaPresent(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "indeed_captcha_" + job.getId());
                return new ApplicationResult(false,
                    "CAPTCHA detected - manual intervention required",
                    job.getApplyUrl());
            }

            // Click apply button
            if (!clickApplyButton(driver)) {
                screenshotPath = browserService.takeScreenshot(driver, "indeed_apply_click_failed_" + job.getId());
                return new ApplicationResult(false,
                    "Failed to click apply button",
                    job.getApplyUrl());
            }

            // Handle different application flows
            if (isExternalApplication(driver)) {
                // External application - just track the click
                screenshotPath = browserService.takeScreenshot(driver, "indeed_external_apply_" + job.getId());
                return new ApplicationResult(true,
                    "Redirected to external application site",
                    job.getApplyUrl());
            } else {
                // Indeed's application form
                if (!fillIndeedApplicationForm(driver, user)) {
                    screenshotPath = browserService.takeScreenshot(driver, "indeed_form_fill_failed_" + job.getId());
                    return new ApplicationResult(false,
                        "Failed to fill Indeed application form",
                        job.getApplyUrl());
                }

                // Submit application
                if (!submitIndeedApplication(driver)) {
                    screenshotPath = browserService.takeScreenshot(driver, "indeed_submit_failed_" + job.getId());
                    return new ApplicationResult(false,
                        "Failed to submit Indeed application",
                        job.getApplyUrl());
                }

                screenshotPath = browserService.takeScreenshot(driver, "indeed_success_" + job.getId());
                log.info("Successfully applied to Indeed job: {}", job.getId());
                return new ApplicationResult(true,
                    "Successfully applied via Indeed",
                    job.getApplyUrl());
            }

        } catch (Exception e) {
            log.error("Error during Indeed automation for job {}: {}", job.getId(), e.getMessage(), e);
            if (driver != null) {
                screenshotPath = browserService.takeScreenshot(driver, "indeed_error_" + job.getId());
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
     * Check if application is available
     */
    private boolean isApplicationAvailable(ChromeDriver driver) {
        try {
            // Look for apply buttons
            return driver.findElements(By.cssSelector("[data-jk='apply-button'], .jobsearch-IndeedApplyButton, button[aria-label*='Apply']")).size() > 0 ||
                   driver.findElements(By.xpath("//button[contains(text(), 'Apply')]")).size() > 0 ||
                   driver.findElements(By.xpath("//a[contains(text(), 'Apply')]")).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Click apply button
     */
    private boolean clickApplyButton(ChromeDriver driver) {
        try {
            String[] selectors = {
                "[data-jk='apply-button']",
                ".jobsearch-IndeedApplyButton",
                "button[aria-label*='Apply']",
                "//button[contains(text(), 'Apply')]",
                "//a[contains(text(), 'Apply')]"
            };

            for (String selector : selectors) {
                try {
                    WebElement applyButton;
                    if (selector.startsWith("//")) {
                        applyButton = driver.findElement(By.xpath(selector));
                    } else {
                        applyButton = driver.findElement(By.cssSelector(selector));
                    }

                    browserService.scrollToElement(driver, applyButton);
                    applyButton.click();
                    browserService.getRandomDelay(2000, 4000);
                    return true;
                } catch (Exception e) {
                    continue;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Failed to click apply button: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if this is an external application
     */
    private boolean isExternalApplication(ChromeDriver driver) {
        try {
            // Check for external application indicators
            return driver.getCurrentUrl().contains("externalapply") ||
                   driver.findElements(By.cssSelector(".external_apply")).size() > 0 ||
                   driver.findElements(By.xpath("//*[contains(text(), 'external site')]")).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Fill Indeed's application form
     */
    private boolean fillIndeedApplicationForm(ChromeDriver driver, User user) {
        try {
            browserService.getRandomDelay(2000, 3000);

            // Indeed forms are usually simple - just resume upload
            // Look for resume upload
            WebElement resumeInput = null;
            String[] resumeSelectors = {
                "input[type='file']",
                "[data-testid='resume-upload']",
                ".resume-upload input"
            };

            for (String selector : resumeSelectors) {
                try {
                    resumeInput = driver.findElement(By.cssSelector(selector));
                    if (resumeInput.isDisplayed()) {
                        break;
                    }
                } catch (Exception e) {
                    continue;
                }
            }

            if (resumeInput != null) {
                String resumePath = "uploads/resume.pdf";
                resumeInput.sendKeys(System.getProperty("user.dir") + "/" + resumePath);
                browserService.getRandomDelay(2000, 4000);
            }

            // Look for submit button
            WebElement submitButton = findSubmitButton(driver);
            if (submitButton != null) {
                browserService.scrollToElement(driver, submitButton);
                submitButton.click();
                browserService.getRandomDelay(3000, 5000);
            }

            return true;
        } catch (Exception e) {
            log.error("Failed to fill Indeed application form: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Submit Indeed application
     */
    private boolean submitIndeedApplication(ChromeDriver driver) {
        try {
            WebElement submitButton = findSubmitButton(driver);
            if (submitButton != null && submitButton.isEnabled()) {
                browserService.scrollToElement(driver, submitButton);
                submitButton.click();
                browserService.getRandomDelay(3000, 5000);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("Failed to submit Indeed application: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Find submit button
     */
    private WebElement findSubmitButton(ChromeDriver driver) {
        String[] buttonSelectors = {
            "button[type='submit']",
            "[data-testid='submit-button']",
            "//button[contains(text(), 'Submit')]",
            "//button[contains(text(), 'Apply')]",
            "//button[contains(text(), 'Send')]"
        };

        for (String selector : buttonSelectors) {
            try {
                if (selector.startsWith("//")) {
                    return driver.findElement(By.xpath(selector));
                } else {
                    return driver.findElement(By.cssSelector(selector));
                }
            } catch (Exception e) {
                continue;
            }
        }
        return null;
    }
}