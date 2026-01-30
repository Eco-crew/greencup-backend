-- CREATE DATABASE greencup;

CREATE TABLE greencup_branches (
  id CHAR(36) PRIMARY KEY,
  manager_email VARCHAR(32) UNIQUE NOT NULL,
  manager_name VARCHAR(4),
  manager_phone_number VARCHAR(12),
  password_hash VARBINARY(60),
  login_type ENUM('OAuth', 'Local') Default 'OAuth' NOT NULL,
  branch_name VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE partners (
  id CHAR(36) PRIMARY KEY,
  manager_email VARCHAR(32) UNIQUE NOT NULL,
  manager_name VARCHAR(4),
  manager_nickname VARCHAR(16),
  manager_phone_number VARCHAR(12) NOT NULL,
  site_name VARCHAR(32) NOT NULL,
  site_address VARCHAR(64) NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  closed_days TINYINT UNSIGNED DEFAULT 0 NOT NULL,
  password_hash VARBINARY(60),
  login_type ENUM('OAuth', 'Local') Default 'OAuth' NOT NULL,
  greencup_branch_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (greencup_branch_id)
    REFERENCES greencup_branches(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;


CREATE TABLE contracts (
  id CHAR(36) PRIMARY KEY,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  daily_cup_quantity, SMALLINT UNSIGNED DEFAULT 0 NOT NULL,
  deliver_by_time TIME NOT NULL,
  greencup_branch_id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  note VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
  partner_id CHAR(36) NOT NULL,
  closed_date DATE NOT NULL,
)

CREATE TABLE daily_rentals (
  id CHAR(36) PRIMARY KEY,
  rented_cup_quantity SMALLINT UNSIGNED DEFAULT 0 NOT NULL,
  returned_cup_quantity SMALLINT UNSIGNED DEFAULT 0 NOT NULL,
  lost_cup_quantity SMALLINT UNSIGNED DEFAULT 0 NOT NULL,
  rental_date DATE DEFAULT CURDATE() NOT NULL,
  deliver_by_time TIME NOT NULL,
  greencup_branch_id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (greencup_branch_id)
    REFERENCES greencup_branches(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,  
  FOREIGN KEY (partner_id)
    REFERENCES partners(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)