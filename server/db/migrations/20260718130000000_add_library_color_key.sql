-- Up Migration
ALTER TABLE libraries
DROP CONSTRAINT libraries_icon_key_check;

ALTER TABLE libraries
ADD COLUMN color_key varchar(20) NOT NULL DEFAULT 'primary',
ADD CONSTRAINT libraries_color_key_check CHECK (
  color_key IN ('primary', 'secondary', 'accent')
),
ADD CONSTRAINT libraries_icon_key_check CHECK (
  icon_key IN (
    'folder', 'utensils', 'soup', 'archive', 'book', 'heart', 'star',
    'coffee', 'calendar', 'leaf', 'bowl', 'drink'
  )
);

-- Down Migration
ALTER TABLE libraries
DROP CONSTRAINT libraries_color_key_check,
DROP COLUMN color_key,
DROP CONSTRAINT libraries_icon_key_check;

ALTER TABLE libraries
ADD CONSTRAINT libraries_icon_key_check CHECK (
  icon_key IN (
    'folder', 'utensils', 'soup', 'archive', 'book', 'heart', 'star',
    'coffee', 'calendar', 'leaf'
  )
);
