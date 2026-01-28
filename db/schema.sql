-- CREATE DATABASE greencup;

CREATE TABLE greencup_branches (
  id CHAR(36) PRIMARY KEY, -- UUID
  manager_email VARCHAR(32) UNIQUE NOT NULL, -- email (Login ID). 중복 가입 불허
  manager_name VARCHAR(4), -- 편의를 위해서 Nullable 설정 (추후 필요하면 NOT NULL 설정)
  manager_phone_number VARCHAR(12), -- "
  password_hash VARBINARY(60), -- BCrypt hash
  login_type ENUM('OAuth', 'Local') Default 'OAuth' NOT NULL,
  branch_name VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE partners (
  id CHAR(36) PRIMARY KEY, -- UUID
  manager_email VARCHAR(32) UNIQUE NOT NULL, -- email (Login ID). 중복 가입 불허
  manager_name VARCHAR(4) NOT NULL,
  manager_nickname VARCHAR(16) NOT NULL,
  manager_phone_number VARCHAR(12) NOT NULL,
  site_name VARCHAR(32) NOT NULL, -- 사업장명(지점일 경우 지점명. 업종이 다양해서 '사업장'이라고 칭함)
  site_address VARCHAR(64) NOT NULL,
  password_hash VARBINARY(60),
  login_type ENUM('OAuth', 'Local') Default 'OAuth' NOT NULL,
  greencup_branch_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (greencup_branch_id)
    REFERENCES greencup_branches(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;
-- SNS Login 회원(login_type = 'OAuth')는 비밀번호 해쉬가 없다. (Nullable)
-- 단, 로그인 유형과 무관하게 name, nickname 중 한 개는 있어야 한다.



-- CREATE TABLE users (
--   id CHAR(36) PRIMARY KEY, -- UUID
--   name VARCHAR(8) NOT NULL,
--   email VARCHAR(128) UNIQUE,
--   password_hash VARBINARY(60),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- )
-- CHARACTER SET utf8mb4
-- COLLATE utf8mb4_0900_ai_ci;



-- 재사용 관리자 - 요청 현황 | 대여 현황 | 인사이트 (통계) | 제휴업체에 문의
-- 제휴업체 관리자 - 대여 관리 | 대여 기록 | 인사이트 (통계) | 재사용 업체에 문의

-- 회원 정보
