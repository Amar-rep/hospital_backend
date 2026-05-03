CREATE TABLE IF NOT EXISTS auth_challenges (
                                               challenge_id     UUID PRIMARY KEY,
                                               registration_id  UUID NOT NULL
                                               REFERENCES devices(registration_id)
                                                ON DELETE CASCADE,

                                               server_random    TEXT NOT NULL,

                                               issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                                expires_at       TIMESTAMPTZ NOT NULL


    );
