-- Create database and add this manually
CREATE SEQUENCE IF NOT EXISTS snowflake_seq START 1 INCREMENT 1 CACHE 256;
CREATE OR REPLACE FUNCTION generate_snowflake_id(shard_version SMALLINT, shard_id SMALLINT)
RETURNS BIGINT AS $$
DECLARE
    CUSTOM_EPOCH CONSTANT BIGINT := 1700000000000;
    TIMESTAMP_BITS CONSTANT INT := 41;
    SHARD_VERSION_BITS CONSTANT INT := 7;
    SHARD_ID_BITS CONSTANT INT := 8;
    COUNTER_BITS CONSTANT INT := 8;

    SHARD_ID_SHIFT CONSTANT INT := COUNTER_BITS;
    SHARD_VERSION_SHIFT CONSTANT INT := SHARD_ID_BITS + COUNTER_BITS;
    TIMESTAMP_SHIFT CONSTANT INT := SHARD_VERSION_BITS + SHARD_ID_BITS + COUNTER_BITS;

    current_ms BIGINT;
    timestamp_part BIGINT;
    counter_value BIGINT;
BEGIN
    current_ms := EXTRACT(EPOCH FROM clock_timestamp()) * 1000;
    timestamp_part := current_ms - CUSTOM_EPOCH;

    counter_value := nextval('snowflake_seq') % (1 << COUNTER_BITS);

    RETURN ((timestamp_part << TIMESTAMP_SHIFT)
            | (shard_version::BIGINT << SHARD_VERSION_SHIFT)
            | (shard_id::BIGINT << SHARD_ID_SHIFT)
            | counter_value);
END;
$$ LANGUAGE plpgsql VOLATILE;