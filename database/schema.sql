-- SLC Ads Market database (PostgreSQL 13 or newer)
--
-- 1. Create the database and a limited user (run as the postgres superuser):
--      CREATE USER slc_app WITH PASSWORD 'choose-a-strong-password';
--      CREATE DATABASE slc OWNER slc_app;
-- 2. Load this file:   psql -U slc_app -d slc -f database/schema.sql
-- 3. Load sample data: psql -U slc_app -d slc -f database/seed.sql
--
-- If your site already has a users table from the sign-in system, delete the
-- "users" block below and point sellers.user_id at your own table instead.

BEGIN;

CREATE TABLE users (
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(30)  NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_.]{3,30}$'),
    full_name      VARCHAR(120) NOT NULL,
    email          VARCHAR(160) UNIQUE,           -- also needed for payments (Paystack asks for an email)
    password_hash  VARCHAR(255),                  -- Argon2id hash made by PHP password_hash(); never the password
    school         VARCHAR(160),
    department     VARCHAR(120),
    admission_year SMALLINT,
    programme_years SMALLINT,
    admission_no   VARCHAR(40),                   -- read from the ID card when it matched
    verification   VARCHAR(14) NOT NULL DEFAULT 'unverified'
                   CHECK (verification IN ('unverified', 'auto_matched', 'needs_review', 'verified', 'rejected')),
    is_searchable  BOOLEAN      NOT NULL DEFAULT TRUE,   -- the student can hide themselves from search
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id          SMALLSERIAL PRIMARY KEY,
    slug        VARCHAR(30)  NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
    name        VARCHAR(60)  NOT NULL,
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE TABLE ad_packages (
    id              SMALLSERIAL PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(40) NOT NULL,
    price_naira     INTEGER     NOT NULL CHECK (price_naira >= 0),
    views_included  INTEGER     NOT NULL CHECK (views_included > 0),
    days            SMALLINT    NOT NULL CHECK (days > 0),
    priority        SMALLINT    NOT NULL DEFAULT 1      -- higher packages are listed first
);

CREATE TABLE sellers (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT REFERENCES users (id) ON DELETE SET NULL,
    business_name  VARCHAR(120) NOT NULL,
    category_id    SMALLINT     NOT NULL REFERENCES categories (id),
    bio            VARCHAR(240),
    location       VARCHAR(160),
    phone          VARCHAR(20),
    verified       BOOLEAN      NOT NULL DEFAULT FALSE,   -- set by an SLC admin
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX sellers_one_per_user ON sellers (user_id) WHERE user_id IS NOT NULL;

CREATE TABLE ads (
    id             BIGSERIAL PRIMARY KEY,
    seller_id      BIGINT       NOT NULL REFERENCES sellers (id) ON DELETE CASCADE,
    category_id    SMALLINT     NOT NULL REFERENCES categories (id),
    package_id     SMALLINT     NOT NULL REFERENCES ad_packages (id),
    title          VARCHAR(120) NOT NULL,
    body           TEXT         NOT NULL CHECK (char_length(body) <= 1000),
    offer_text     VARCHAR(120),                          -- e.g. "10% off with your SLC username"
    price_naira    INTEGER      CHECK (price_naira >= 0), -- NULL means "ask the seller"
    price_note     VARCHAR(40),                           -- e.g. "per plate"
    location       VARCHAR(160),
    contact_phone  VARCHAR(20),
    image_path     VARCHAR(255),
    status         VARCHAR(10)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'live', 'paused', 'rejected', 'expired')),
    reject_reason  TEXT,
    views          INTEGER      NOT NULL DEFAULT 0,
    contact_taps   INTEGER      NOT NULL DEFAULT 0,
    saves          INTEGER      NOT NULL DEFAULT 0,
    starts_at      TIMESTAMPTZ,
    ends_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX ads_live_idx     ON ads (status, ends_at);
CREATE INDEX ads_category_idx ON ads (category_id);
CREATE INDEX ads_seller_idx   ON ads (seller_id);
CREATE INDEX ads_created_idx  ON ads (created_at DESC);

-- One row per temporary payment account we ask Paystack for. The account number below is a
-- one-time account for that single payment; it is NOT your own bank account.
CREATE TABLE payments (
    id             BIGSERIAL PRIMARY KEY,
    ad_id          BIGINT      NOT NULL REFERENCES ads (id) ON DELETE CASCADE,
    reference      VARCHAR(64) NOT NULL UNIQUE,            -- Paystack's reference for this charge
    method         VARCHAR(20) NOT NULL DEFAULT 'paystack_transfer',
    amount_naira   INTEGER     NOT NULL CHECK (amount_naira >= 0),
    account_bank   VARCHAR(80),
    account_number VARCHAR(20),
    account_name   VARCHAR(120),
    expires_at     TIMESTAMPTZ NOT NULL,
    status         VARCHAR(10) NOT NULL DEFAULT 'awaiting'
                   CHECK (status IN ('awaiting', 'success', 'expired', 'failed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at        TIMESTAMPTZ,
    note           TEXT
);
CREATE INDEX payments_ad_idx ON payments (ad_id, status);

-- One row per visitor, per ad, per event type, per day. Stops refreshes from inflating counts.
CREATE TABLE ad_events (
    id           BIGSERIAL PRIMARY KEY,
    ad_id        BIGINT      NOT NULL REFERENCES ads (id) ON DELETE CASCADE,
    event_type   VARCHAR(10) NOT NULL CHECK (event_type IN ('view', 'contact', 'save', 'report')),
    visitor_hash CHAR(64)    NOT NULL,
    event_day    DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (ad_id, event_type, visitor_hash, event_day)
);

-- ---- posts and videos (searched by api/search.php) --------------------------------
CREATE TABLE posts (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    body        TEXT        NOT NULL CHECK (char_length(body) <= 5000),
    visibility  VARCHAR(10) NOT NULL DEFAULT 'everyone' CHECK (visibility IN ('everyone', 'school', 'friends', 'only_me')),
    is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    search_vec  tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(body, ''))) STORED
);
CREATE INDEX posts_search_idx  ON posts USING gin (search_vec);
CREATE INDEX posts_created_idx ON posts (created_at DESC);

-- Photos and videos. The files live in object storage (S3 / R2 / MinIO), not in this database.
CREATE TABLE media (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    post_id      BIGINT       REFERENCES posts (id) ON DELETE SET NULL,
    kind         VARCHAR(10)  NOT NULL CHECK (kind IN ('photo', 'video')),
    title        VARCHAR(200),
    object_key   VARCHAR(255) NOT NULL,           -- e.g. videos/2026/10/abc123.mp4 (compressed copy)
    thumb_key    VARCHAR(255),                    -- poster picture
    duration_sec INTEGER,
    status       VARCHAR(12)  NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
    visibility   VARCHAR(10)  NOT NULL DEFAULT 'everyone' CHECK (visibility IN ('everyone', 'school', 'friends', 'only_me')),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    search_vec   tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title, ''))) STORED
);
CREATE INDEX media_search_idx ON media USING gin (search_vec);
CREATE INDEX media_user_idx   ON media (user_id, created_at DESC);

-- Friends. Add two rows (one each way) when a request is accepted.
CREATE TABLE friendships (
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    friend_id  BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status     VARCHAR(10) NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id <> friend_id)
);
CREATE INDEX friendships_friend_idx ON friendships (friend_id);

-- ---- admin accounts (password + 6-digit code from an authenticator app) -------------
CREATE TABLE admin_users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    totp_secret   TEXT         NOT NULL DEFAULT '',   -- no longer used (admins sign in with email and password)
    last_totp_step BIGINT,                        -- stops the same code being used twice
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMIT;

-- Optional: faster searching once you have thousands of ads (needs the pg_trgm extension).
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX ads_title_trgm ON ads USING gin (title gin_trgm_ops);
-- CREATE INDEX ads_body_trgm  ON ads USING gin (body gin_trgm_ops);

-- Handy admin queries -------------------------------------------------------------
-- Paid ads waiting for your review:
--   SELECT a.id, s.business_name, a.title, p.amount_naira, p.paid_at
--   FROM ads a JOIN sellers s ON s.id = a.seller_id
--   JOIN payments p ON p.ad_id = a.id AND p.status = 'success'
--   WHERE a.status = 'pending' ORDER BY p.paid_at;
-- Approve an ad (only after it was paid). It runs for the number of days in its package:
--   UPDATE ads a SET status = 'live', starts_at = now(), ends_at = now() + make_interval(days => k.days), updated_at = now()
--   FROM ad_packages k
--   WHERE k.id = a.package_id AND a.id = 123
--     AND EXISTS (SELECT 1 FROM payments p WHERE p.ad_id = a.id AND p.status = 'success');
-- Reject an ad (refund it from your Paystack dashboard if it was paid):
--   UPDATE ads SET status = 'rejected', reject_reason = 'Does not match SLC ad guidelines', updated_at = now() WHERE id = 123;
-- Retire ads whose time is up:
--   UPDATE ads SET status = 'expired', updated_at = now() WHERE status = 'live' AND ends_at <= now();
-- Clean up ads that were started but never paid (run daily):
--   DELETE FROM ads a WHERE a.status = 'pending' AND a.created_at < now() - interval '1 day'
--     AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.ad_id = a.id AND p.status = 'success');
