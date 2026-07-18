-- Up Migration
ALTER TABLE libraries
ADD COLUMN icon_key varchar(30) NOT NULL DEFAULT 'folder',
ADD CONSTRAINT libraries_icon_key_check CHECK (
  icon_key IN (
    'folder',
    'utensils',
    'soup',
    'archive',
    'book',
    'heart',
    'star',
    'coffee',
    'calendar',
    'leaf'
  )
);

-- Down Migration
ALTER TABLE libraries
DROP CONSTRAINT libraries_icon_key_check,
DROP COLUMN icon_key;
