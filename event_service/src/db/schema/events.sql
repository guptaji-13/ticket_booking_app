CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,  -- movie, concert, etc.
    description TEXT,
    language TEXT,
    duration_minutes INT,
    metadata MAP<TEXT, TEXT>,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
