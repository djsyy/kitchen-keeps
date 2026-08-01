-- Up Migration
ALTER TABLE cook_sessions
ADD COLUMN cancelled_at timestamp with time zone,
ADD COLUMN cancellation_reason varchar(20)
  CONSTRAINT cook_sessions_cancellation_reason_check CHECK (
    cancellation_reason IN ('manual', 'expired')
  );

-- Down Migration
ALTER TABLE cook_sessions
DROP CONSTRAINT cook_sessions_cancellation_reason_check,
DROP COLUMN cancellation_reason,
DROP COLUMN cancelled_at;
