CREATE TABLE IF NOT EXISTS shows (
    show_id TEXT PRIMARY KEY,
    event_id TEXT,
    venue_id TEXT,
    screen_details MAP<TEXT, TEXT>,
    show_timestamp TIMESTAMP,
    status TEXT,  -- 'scheduled' | 'airing' | 'cancelled' | 'completed'
    last_updated TIMESTAMP
);
