-- Runs automatically the first time the Postgres data volume is created
-- (docker-entrypoint-initdb.d scripts only run against an empty data
-- directory, never on subsequent restarts). The postgis/postgis image
-- already bundles the extension binaries; this just switches it on
-- inside our specific database.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Sanity check visible in `docker compose logs postgres` on first boot.
DO $$
BEGIN
    RAISE NOTICE 'PostGIS extension enabled: %', PostGIS_Version();
END $$;
