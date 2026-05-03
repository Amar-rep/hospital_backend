package com.example_amar.central_athority.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "auth_challenges")
public class AuthChallenge {
    @Id
    @Column(name = "challenge_id", nullable = false, length = Integer.MAX_VALUE)
    private String challengeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "registration_id", nullable = false, referencedColumnName = "registration_id")
    private Device registration;

    @Column(name = "server_random", nullable = false, length = Integer.MAX_VALUE)
    private String serverRandom;

    @Column(name = "issued_epoch", nullable = false)
    private Long issuedEpoch;

    @Column(name = "expires_epoch", nullable = false)
    private Long expiresEpoch;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

}