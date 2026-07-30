-- Up Migration
CREATE FUNCTION touch_cook_session_activity()
RETURNS trigger AS $$
BEGIN
  UPDATE cook_sessions
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.cook_session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER touch_cook_session_activity_from_item
AFTER UPDATE OF status ON cook_session_items
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION touch_cook_session_activity();

-- Down Migration
DROP TRIGGER IF EXISTS touch_cook_session_activity_from_item
ON cook_session_items;

DROP FUNCTION IF EXISTS touch_cook_session_activity();
