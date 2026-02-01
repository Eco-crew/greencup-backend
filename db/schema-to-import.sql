-- CREATE DATABASE greencup;

CREATE TABLE greencup_branches (
  id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin,
  manager_email VARCHAR(32) NOT NULL UNIQUE,
  manager_name VARCHAR(4),
  manager_phone_number VARCHAR(12),
  password_hash VARBINARY(60),
  login_type ENUM('OAuth', 'Local') NOT NULL Default 'OAuth',
  branch_name VARCHAR(32) NOT NULL,
  total_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  available_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  lost_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE partners (
  id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin,
  manager_email VARCHAR(32) NOT NULL UNIQUE,
  manager_name VARCHAR(4),
  manager_nickname VARCHAR(16),
  manager_phone_number VARCHAR(12) NOT NULL,
  site_name VARCHAR(32) NOT NULL,
  site_address VARCHAR(64) NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  closed_days TINYINT UNSIGNED NOT NULL DEFAULT 0,
  password_hash VARBINARY(60),
  login_type ENUM('OAuth', 'Local') NOT NULL Default 'OAuth',
  business_type ENUM('office', 'public', 'cafe', 'event') NOT NULL Default 'office',
  greencup_branch_id CHAR(36) NOT NULL COLLATE utf8mb4_bin,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (greencup_branch_id)
    REFERENCES greencup_branches(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;


CREATE TABLE contracts (
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  daily_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  deliver_by_time TIME NOT NULL,
  greencup_branch_id CHAR(36) NOT NULL COLLATE utf8mb4_bin,
  partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin,
  note VARCHAR(128),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (partner_id),
  FOREIGN KEY (greencup_branch_id)
    REFERENCES greencup_branches(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  FOREIGN KEY (partner_id)
    REFERENCES partners(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE special_closed_dates (
  partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin,
  closed_date DATE NOT NULL,
  note VARCHAR(128),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (partner_id, closed_date),
  FOREIGN KEY (partner_id)
  REFERENCES partners(id)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE daily_rentals (
  id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin,
  rented_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  returned_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  lost_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  rental_date DATE NOT NULL,
  deliver_by_time TIME NOT NULL,
  greencup_branch_id CHAR(36) NOT NULL COLLATE utf8mb4_bin,
  partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin,
  status ENUM('complete', 'incomplete', 'cancelled') NOT NULL Default 'incomplete',
  note VARCHAR(128),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (greencup_branch_id)
    REFERENCES greencup_branches(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  FOREIGN KEY (partner_id)
    REFERENCES partners(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;
