package com.blitzphoto.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger Configuration
 * 
 * Configures API documentation with Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI blitzPhotoOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BlitzPhoto API")
                        .description("Lightning-fast photo upload system supporting 100 concurrent uploads with Blitz Speed")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("BlitzPhoto Team")
                                .email("team@blitzphoto.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT authentication token")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}

