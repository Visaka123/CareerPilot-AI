package com.careerpilot.service;

import io.github.bonigarcia.wdm.WebDriverManager;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Base browser automation service with common functionality
 */
@Service
@Slf4j
public class BrowserAutomationService {

    private static final String SCREENSHOT_DIR = "uploads/screenshots";

    static {
        // Setup Chrome driver
        WebDriverManager.chromedriver().setup();
    }

    /**
     * Create a configured Chrome WebDriver instance
     */
    public ChromeDriver createWebDriver() {
        ChromeOptions options = new ChromeOptions();

        // Anti-detection measures
        options.addArguments("--disable-blink-features=AutomationControlled");
        options.addArguments("--disable-extensions");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1920,1080");

        // User agent to appear more human
        options.addArguments("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        // Disable images for faster loading
        Map<String, Object> prefs = new HashMap<>();
        prefs.put("profile.managed_default_content_settings.images", 2);
        options.setExperimentalOption("prefs", prefs);

        // Uncomment for headless mode in production
        // options.addArguments("--headless");

        return new ChromeDriver(options);
    }

    /**
     * Wait for element to be clickable with timeout
     */
    public WebElement waitForElementClickable(WebDriver driver, By locator, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    /**
     * Wait for element to be visible with timeout
     */
    public WebElement waitForElementVisible(WebDriver driver, By locator, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    /**
     * Safe click with retry
     */
    public boolean safeClick(WebDriver driver, By locator, int maxRetries) {
        for (int i = 0; i < maxRetries; i++) {
            try {
                WebElement element = waitForElementClickable(driver, locator, 10);
                element.click();
                Thread.sleep(getRandomDelay(1000, 3000)); // Random delay
                return true;
            } catch (Exception e) {
                log.warn("Click attempt {} failed: {}", i + 1, e.getMessage());
                if (i == maxRetries - 1) {
                    return false;
                }
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return false;
    }

    /**
     * Safe send keys with retry
     */
    public boolean safeSendKeys(WebDriver driver, By locator, String text, int maxRetries) {
        for (int i = 0; i < maxRetries; i++) {
            try {
                WebElement element = waitForElementVisible(driver, locator, 10);
                element.clear();
                element.sendKeys(text);
                Thread.sleep(getRandomDelay(500, 1500));
                return true;
            } catch (Exception e) {
                log.warn("Send keys attempt {} failed: {}", i + 1, e.getMessage());
                if (i == maxRetries - 1) {
                    return false;
                }
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return false;
    }

    /**
     * Take screenshot and save to file
     */
    public String takeScreenshot(WebDriver driver, String filename) {
        try {
            // Create screenshots directory if it doesn't exist
            Path screenshotPath = Paths.get(SCREENSHOT_DIR);
            if (!Files.exists(screenshotPath)) {
                Files.createDirectories(screenshotPath);
            }

            // Take screenshot
            TakesScreenshot screenshot = (TakesScreenshot) driver;
            byte[] screenshotBytes = screenshot.getScreenshotAs(OutputType.BYTES);

            // Save to file
            String fullPath = SCREENSHOT_DIR + File.separator + filename + ".png";
            Files.write(Paths.get(fullPath), screenshotBytes);

            return fullPath;
        } catch (Exception e) {
            log.error("Failed to take screenshot: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if CAPTCHA is present
     */
    public boolean isCaptchaPresent(WebDriver driver) {
        try {
            // Common CAPTCHA selectors
            String[] captchaSelectors = {
                "[class*='captcha']",
                "[id*='captcha']",
                ".recaptcha",
                "#captcha",
                "[class*='recaptcha']"
            };

            for (String selector : captchaSelectors) {
                if (!driver.findElements(By.cssSelector(selector)).isEmpty()) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get random delay to appear more human
     */
    public long getRandomDelay(long min, long max) {
        return min + (long) (Math.random() * (max - min));
    }

    /**
     * Scroll element into view
     */
    public void scrollToElement(WebDriver driver, WebElement element) {
        try {
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);
            Thread.sleep(getRandomDelay(500, 1000));
        } catch (Exception e) {
            log.warn("Failed to scroll to element: {}", e.getMessage());
        }
    }

    /**
     * Close browser safely
     */
    public void closeBrowser(WebDriver driver) {
        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception e) {
                log.warn("Error closing browser: {}", e.getMessage());
            }
        }
    }
}