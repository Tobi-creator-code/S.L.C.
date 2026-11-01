-- Starting data for the LIVE site: ad categories and ad prices only. No sample sellers or ads.
-- Run once, after schema.sql.

BEGIN;

INSERT INTO categories (slug, name, sort_order) VALUES
  ('tech',     'Tech & repairs',  1),
  ('food',     'Food & snacks',   2),
  ('fashion',  'Fashion',         3),
  ('books',    'Books & notes',   4),
  ('beauty',   'Beauty & hair',   5),
  ('services', 'Services',        6),
  ('rooms',    'Rooms & hostels', 7);

INSERT INTO ad_packages (code, name, price_naira, views_included, days, priority) VALUES
  ('basic',   'Basic',    500,  500,  3, 1),
  ('boost',   'Boosted', 1500, 2000,  7, 2),
  ('premium', 'Premium', 3000, 6000, 14, 3);

COMMIT;
