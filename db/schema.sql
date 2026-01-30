-- CREATE DATABASE greencup;

-- 그린컵(재사용 컵 업체) 지점
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


-- 제휴 업체 (그린컵 고객)
CREATE TABLE partners (
  id CHAR(36) PRIMARY KEY, -- UUID
  manager_email VARCHAR(32) UNIQUE NOT NULL, -- email (Login ID). 중복 가입 불허
  manager_name VARCHAR(4),
  manager_nickname VARCHAR(16), -- 관리자 별명 (이름과 별명중 하나는 꼭 있어야 한다)
  manager_phone_number VARCHAR(12) NOT NULL,
  site_name VARCHAR(32) NOT NULL, -- 사업장명(지점일 경우 지점명. 업종이 다양해서 '사업장'이라고 칭함)
  site_address VARCHAR(64) NOT NULL,
  open_time TIME NOT NULL, -- 영업 시작 시간
  close_time TIME NOT NULL, -- 영업 종료 시간
  closed_days TINYINT UNSIGNED DEFAULT 0 NOT NULL, -- 1bit 정수형에 & 연산자로 bit 연산. 예) 01000000 (10진수 64) = 월, 00000011 (10진수 3) = 토일
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
-- SNS Login 회원(login_type = 'OAuth')는 비밀번호 해쉬가 없다. (Nullable)
-- 단, 로그인 유형과 무관하게 name, nickname 중 한 개는 있어야 한다.


-- 그린컵 지점과 제휴 업체 사이의 계약
CREATE TABLE contracts (
  id CHAR(36) PRIMARY KEY, -- UUID
  contract_start_date DATE NOT NULL,-- 계약(렌탈) 시작일자
  contract_end_date DATE NOT NULL,-- 계약 종료일자
  daily_cup_quantity, SMALLINT UNSIGNED DEFAULT 0 NOT NULL, -- 일일 컵 대여 개수  / SMALLINT: 0~65535개 가능
  deliver_by_time TIME NOT NULL, -- 매일 배송시간이므로 일자가 의미 없고 시간만 중요. 하지만 일일 요청으로 복사해야 하는데 TIME → DATETIME 복사 가능?
  greencup_branch_id CHAR(36) NOT NULL, -- UUID
  partner_id CHAR(36) NOT NULL, -- UUID
  note VARCHAR(128), -- 비고
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

-- 제휴 업체 정기 휴무일
-- 정규화해서 따로 테이블로 만들기는 과한 것 같아서
-- partners 테이블에 closed_days TINYINT UNSIGNED DEFAULT 0 컬럼을 만들고 (1bit 정수형)
-- & 연산자로 bit 연산해서 처리하려고 생각중

-- 제휴 업체 비정기 휴무일
CREATE TABLE special_closed_dates (
  partner_id CHAR(36) NOT NULL, -- UUID
  closed_date DATE NOT NULL,
  -- 미완성
)

-- 일일 (대여/수거) 요청 테이블. 계약 테이블 정보를 기반으로 매일 자정에 당일 요청이 자동 생성 
CREATE TABLE daily_rentals (
  id CHAR(36) PRIMARY KEY, -- UUID
  rented_cup_quantity SMALLINT UNSIGNED DEFAULT 0 NOT NULL, -- 일일 대여 컵 개수
  returned_cup_quantity SMALLINT UNSIGNED DEFAULT 0 NOT NULL, -- 일일 반납 컵 개수 (다음 날에 그린컵 관리자가 '완료' 처리할 때 업데이트 됨)
  lost_cup_quantity SMALLINT UNSIGNED DEFAULT 0 NOT NULL, -- 일일 분실 컵 개수 (")
  rental_date DATE DEFAULT CURDATE() NOT NULL, -- 대여 일자는 자동으로 오늘 날짜
  deliver_by_time TIME NOT NULL,
  greencup_branch_id CHAR(36) NOT NULL, -- UUID
  partner_id CHAR(36) NOT NULL, -- UUID
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
