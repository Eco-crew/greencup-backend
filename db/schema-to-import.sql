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
  manager_name VARCHAR(4) NOT NULL,
  manager_nickname VARCHAR(16) NOT NULL,
  manager_phone_number VARCHAR(12) NOT NULL,
  site_name VARCHAR(32) NOT NULL,
  site_address VARCHAR(64) NOT NULL,
  password_hash VARBINARY(60),
  login_type ENUM('OAuth', 'Local') Default 'OAuth' NOT NULL,
  greencup_branch_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (greencup_branch_id)
    REFERENCES greencup_branches(id)
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;
