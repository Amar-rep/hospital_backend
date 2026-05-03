package com.example_amar.central_athority.repository;

import com.example_amar.central_athority.model.AuthChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
public interface AuthChallengeRepository extends JpaRepository<AuthChallenge, UUID> {

    Optional<AuthChallenge> findByChallengeId(String challengeId);
}
