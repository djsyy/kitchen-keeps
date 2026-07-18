-- Up Migration
ALTER TABLE libraries
DROP CONSTRAINT libraries_icon_key_check;

ALTER TABLE libraries
ADD CONSTRAINT libraries_icon_key_check CHECK (
  icon_key IN (
    'folder', 'utensils', 'soup', 'archive', 'book', 'heart', 'star',
    'coffee', 'calendar', 'leaf', 'bowl', 'drink', 'cookie', 'burger',
    'ice-cream', 'pizza', 'cake', 'croissant', 'salad'
  )
);

-- Down Migration
ALTER TABLE libraries
DROP CONSTRAINT libraries_icon_key_check;

ALTER TABLE libraries
ADD CONSTRAINT libraries_icon_key_check CHECK (
  icon_key IN (
    'folder', 'utensils', 'soup', 'archive', 'book', 'heart', 'star',
    'coffee', 'calendar', 'leaf', 'bowl', 'drink'
  )
);
