package com.blitzphoto;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Basic application context test
 * 
 * Verifies that the Spring Boot application context loads successfully.
 */
@SpringBootTest
@ActiveProfiles("test")
class BlitzPhotoApplicationTests {

    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully
    }
}

