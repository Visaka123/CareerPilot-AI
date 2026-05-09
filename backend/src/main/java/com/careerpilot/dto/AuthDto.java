package com.careerpilot.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String name;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8)
        private String password;
    }

    @Data
    public static class AuthResponse {
        private UserDto user;
        private String token;

        public AuthResponse(UserDto user, String token) {
            this.user = user;
            this.token = token;
        }
    }

    @Data
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String title;
        private String location;
        private String bio;
        private String linkedin;
        private String github;
        private String role;
        private String plan;
    }

    @Data
    public static class UpdateProfileRequest {
        private String name;
        private String title;
        private String location;
        private String bio;
        private String linkedin;
        private String github;
    }
}
