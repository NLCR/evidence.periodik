--liquibase formatted sql

--changeset permonik:1
CREATE TABLE export_template (
    id UUID PRIMARY KEY,
    primary_volume_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    version BIGINT NOT NULL CHECK (version >= 0),
    state VARCHAR(32) NOT NULL CHECK (state IN ('CREATED', 'WAITING_FOR_RESCAN', 'FINALIZED', 'LATE_FIXES')),
    content JSONB NOT NULL CHECK (jsonb_typeof(content) = 'object'),
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by TEXT NOT NULL,
    modified_date TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_by TEXT NOT NULL,
    deleted_date TIMESTAMP WITH TIME ZONE,
    deleted_by TEXT,
    CHECK ((deleted_date IS NULL) = (deleted_by IS NULL)),
    CHECK (primary_volume_id IS NOT DISTINCT FROM content #>> '{primaryVolume,id}'),
    CHECK (owner_id IS NOT DISTINCT FROM content #>> '{primaryVolume,ownerId}')
);

CREATE UNIQUE INDEX uq_export_template_active_volume
    ON export_template (primary_volume_id) WHERE deleted_date IS NULL;

--changeset permonik:2
ALTER TABLE export_template ALTER COLUMN id SET DEFAULT uuidv7();
