DROP TABLE IF EXISTS auth_challenges;

-- Create the table with epoch time columns
CREATE TABLE auth_challenges (
                                 challenge_id     TEXT PRIMARY KEY,
                                 registration_id  UUID NOT NULL
                                     REFERENCES devices(registration_id)
                                         ON DELETE CASCADE,
                                 server_random    TEXT NOT NULL,
                                 issued_epoch     BIGINT NOT NULL,
                                 expires_epoch    BIGINT NOT NULL,
                                 created_at       TIMESTAMPTZ DEFAULT NOW()
);
