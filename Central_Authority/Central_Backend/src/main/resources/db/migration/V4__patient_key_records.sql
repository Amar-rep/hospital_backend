CREATE TABLE patient_key_records (
    id BIGSERIAL PRIMARY KEY,
    patient_id VARCHAR(40) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    father_id TEXT NOT NULL,
    father_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    public_key TEXT NOT NULL,
    private_key TEXT NOT NULL,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    access_expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_patient_key_records_patient_id
    ON patient_key_records(patient_id);
