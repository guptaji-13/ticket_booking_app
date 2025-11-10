CREATE TABLE IF NOT EXISTS venues (
    venue_id TEXT PRIMARY KEY,
    name TEXT,
    city TEXT,
    address TEXT,
    total_screens INT,
    metadata TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
