package com.blitzphoto.domain.repository;

import com.blitzphoto.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * User Repository Interface
 * 
 * Spring Data JPA repository for User aggregate.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email
     * 
     * @param email The user email
     * @return Optional user
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by username
     * 
     * @param username The username
     * @return Optional user
     */
    Optional<User> findByUsername(String username);

    /**
     * Check if user exists by email
     * 
     * @param email The user email
     * @return true if user exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if user exists by username
     * 
     * @param username The username
     * @return true if user exists
     */
    boolean existsByUsername(String username);
}

