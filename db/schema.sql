CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NULL,
  role ENUM('owner','admin','staff') NOT NULL DEFAULT 'admin',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  session_token CHAR(64) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_sessions_token (session_token),
  KEY idx_admin_sessions_user (admin_user_id),
  KEY idx_admin_sessions_expires (expires_at),
  CONSTRAINT fk_admin_sessions_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaigns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  name VARCHAR(180) NOT NULL,
  location VARCHAR(180) NOT NULL,
  city VARCHAR(120) NULL,
  workshop_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NULL,
  price_pp DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  seat_capacity INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('draft','active','closed','cancelled') NOT NULL DEFAULT 'draft',
  hdfc_merchant_id VARCHAR(120) NULL,
  hdfc_terminal_id VARCHAR(120) NULL,
  hdfc_qr_config JSON NULL,
  notes TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campaigns_slug (slug),
  KEY idx_campaigns_status_date (status, workshop_date),
  CONSTRAINT fk_campaigns_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rug_designs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  campaign_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(140) NOT NULL,
  image_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rug_designs_campaign (campaign_id),
  CONSTRAINT fk_rug_designs_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  campaign_id BIGINT UNSIGNED NOT NULL,
  registration_code VARCHAR(32) NOT NULL,
  participant_name VARCHAR(140) NOT NULL,
  email VARCHAR(190) NOT NULL,
  mobile VARCHAR(32) NOT NULL,
  company_name VARCHAR(180) NULL,
  team_size INT UNSIGNED NOT NULL DEFAULT 1,
  selected_design_id BIGINT UNSIGNED NULL,
  selected_design_name VARCHAR(140) NULL,
  amount_subtotal DECIMAL(10,2) NOT NULL,
  amount_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_total DECIMAL(10,2) NOT NULL,
  amount_advance DECIMAL(10,2) NOT NULL,
  payment_status ENUM('initiated','pending','paid','failed','expired','refunded','cancelled') NOT NULL DEFAULT 'initiated',
  payment_reference_id VARCHAR(140) NULL,
  hdfc_txn_id VARCHAR(140) NULL,
  notes TEXT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_registrations_code (registration_code),
  KEY idx_registrations_campaign (campaign_id),
  KEY idx_registrations_payment_status (payment_status),
  KEY idx_registrations_registered_at (registered_at),
  KEY idx_registrations_email (email),
  CONSTRAINT fk_registrations_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE RESTRICT,
  CONSTRAINT fk_registrations_design FOREIGN KEY (selected_design_id) REFERENCES rug_designs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  registration_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  provider VARCHAR(40) NOT NULL DEFAULT 'hdfc_vyapar',
  provider_event_id VARCHAR(140) NULL,
  amount DECIMAL(10,2) NULL,
  status VARCHAR(60) NULL,
  payload JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payment_events_registration (registration_id),
  KEY idx_payment_events_provider_event (provider_event_id),
  CONSTRAINT fk_payment_events_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
