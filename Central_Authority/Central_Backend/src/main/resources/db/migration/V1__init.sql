CREATE TABLE installers (
                            id SERIAL PRIMARY KEY,
                            installer_uuid UUID NOT NULL UNIQUE,
                            installer_secret TEXT NOT NULL,
                            name TEXT NOT NULL,
                            is_active BOOLEAN DEFAULT TRUE,
                            created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE applications (
                              app_id TEXT PRIMARY KEY,
                              name TEXT NOT NULL,
                              current_version TEXT NOT NULL,
                              code_hash TEXT NOT NULL,
                              updated_at TIMESTAMPTZ DEFAULT NOW()
);




CREATE TABLE devices (
                         id SERIAL PRIMARY KEY,
                         registration_id UUID NOT NULL UNIQUE,
                         device_id TEXT NOT NULL,


                         app_id VARCHAR(50) REFERENCES applications(app_id),


                         installer_id INT REFERENCES installers(id),

                         app_secret TEXT NOT NULL,
                         status VARCHAR(20) DEFAULT 'ACTIVE',
                         created_at TIMESTAMPTZ DEFAULT NOW()
);