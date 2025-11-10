CREATE TABLE IF NOT EXISTS seat_availability_by_show (
    show_id TEXT,
    seat_id TEXT,
    status TEXT,  -- 'available' | 'booked' | 'locked'
    last_updated TIMESTAMP,
    PRIMARY KEY ((show_id), seat_id)
)
WITH CLUSTERING ORDER BY (seat_id ASC);
