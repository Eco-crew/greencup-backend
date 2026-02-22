CREATE DATABASE greencup
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;


-- 재사용 컵 관리자 - 요청 현황 | 대여 현황 | 인사이트 (통계) | 제휴업체에 문의
-- 제휴업체 관리자 - 대여 관리 | 대여 기록 | 인사이트 (통계) | 재사용 업체에 문의

-- 그린컵(재사용 컵 업체) 지점
CREATE TABLE greencup_branches (
  id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin, -- UUID. 의미 있는 문자열이 아니라서 utf8mb4_bin으로 오버라이드 (byte 단위 비교)
  manager_email VARCHAR(32) NOT NULL UNIQUE, -- email (Login ID). 중복 가입 불허
  manager_name VARCHAR(4) NOT NULL, -- 편의를 위해서 Nullable 설정 (추후 필요하면 NOT NULL 설정)
  manager_phone_number VARCHAR(12) NOT NULL, -- "
  password_hash VARBINARY(60), -- BCrypt hash
  login_type ENUM('OAuth', 'Local') NOT NULL Default 'OAuth',
  branch_name VARCHAR(32) NOT NULL,
  total_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 총 보유 컵 개수 (관리자가 일일 대여 기록을 '완료' 처리할 때 같이 업데이트)
  available_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 대여 가능한 재고 컵 개수 (매일 자정 daily_rentals 자동 생성할 때 + ")
  lost_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 총 분실 컵 개수 (관리자가 일일 대여 기록을 '완료' 처리할 때 같이 업데이트) / 파손은 일단 제외
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;


-- 제휴 업체 (그린컵 고객)
CREATE TABLE partners (
  id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin, -- UUID
  manager_email VARCHAR(32) NOT NULL UNIQUE, -- email (Login ID). 중복 가입 불허
  manager_name VARCHAR(4),
  manager_nickname VARCHAR(16), -- 관리자 별명 (이름과 별명중 하나는 꼭 있어야 한다)
  manager_phone_number VARCHAR(12) NOT NULL,
  site_name VARCHAR(32) NOT NULL, -- 사업장명(지점일 경우 지점명. 업종이 다양해서 '사업장'이라고 칭함)
  site_address VARCHAR(64) NOT NULL,
  open_time TIME NOT NULL, -- 영업 시작 시간
  close_time TIME NOT NULL, -- 영업 종료 시간
  closed_days TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 정기 휴일. 1bit 정수형에 & 연산자로 bit 연산. 예) 01000000 (10진수 64) = 월, 00000011 (10진수 3) = 토일
  password_hash VARBINARY(60), -- BCrypt hash
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
-- SNS Login 회원(login_type = 'OAuth')는 비밀번호 해쉬가 없다. (Nullable)
-- 단, 로그인 유형과 무관하게 name, nickname 중 한 개는 있어야 한다.


-- 그린컵 지점과 제휴 업체 사이의 계약
CREATE TABLE contracts (
  contract_start_date DATE NOT NULL, -- 계약(렌탈) 시작일자
  contract_end_date DATE NOT NULL, -- 계약 종료일자
  daily_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 컵 대여 개수  / SMALLINT: 0~65535개 가능
  deliver_by_time TIME NOT NULL, -- 매일 배송시간이므로 일자가 의미 없고 시간만 중요
  greencup_branch_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
  partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
  note VARCHAR(128), -- 비고
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (partner_id), -- 소규모 프로젝트이므로 그린컵 지점은 DB에 직접 2개 정도만 만들 생각이라서, 편리하게 조회할 수 있도록 PK를 단독키로 설정
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

-- 소규모 웹사이트에서 제휴 업체 정기 휴무일을 정규화해서 따로 테이블로 만들기는 과한 것 같아서
-- partners 테이블에 closed_days TINYINT UNSIGNED 컬럼을 만들고 (1bit 정수형) & 연산자로 bit 연산해서 처리 예정

-- 제휴 업체 비정기 휴무일
CREATE TABLE special_closed_dates (
  partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
  closed_date DATE NOT NULL,
  note VARCHAR(128), -- 비고
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (partner_id, closed_date), -- 한 '제휴 업체'가 '비정기 휴일이 같은' 레코드를 한 개밖에 가질 수 없으므로, PK를 이 복합키로 설정
  FOREIGN KEY (partner_id)
  REFERENCES partners(id)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

-- 일일 (대여/수거) 요청 테이블. 계약 테이블 정보를 기반으로 매일 자정에 당일 요청이 자동 생성 
CREATE TABLE daily_rentals (
  id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin, -- UUID
  rented_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 대여 컵 개수
  returned_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 반납 컵 개수 (다음 날에 그린컵 관리자가 '완료' 처리할 때 업데이트 됨)
  lost_cup_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- 일일 분실 컵 개수 (")
  rental_date DATE NOT NULL,
  deliver_by_time TIME NOT NULL,
  greencup_branch_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
  partner_id CHAR(36) NOT NULL COLLATE utf8mb4_bin, -- UUID
  status ENUM('incomplete', 'complete', 'cancelled') NOT NULL Default 'incomplete', -- 미완료 상태인 요청이 더 위에 정렬되도록 변경 (우선순위 ↑)
  note VARCHAR(128), -- 비고
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- PRIMARY KEY (partner_id, rental_date), -- 한 '제휴 업체'가 '일일' 요청 레코드를 한 개밖에 가질 수 없으므로, PK를 이 복합키로 설정해야 함
  -- 이미 id를 PK로 설정해놓은데다가, 위 복합키를 PK로 걸면 일일 요청 자동 생성 스케쥴링을 짧은 간격으로 테스트할 수 없어서 일단 보류
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

-- 아래와 같은 트리거는 DDL만 봐서는 존재 여부도 알 수 없어서 디버깅이 어렵다. → 백엔드에서 처리하는 게 낫다고 해서 그렇게 할 예정
-- (인수인계가 제대로 되지 않으면 더욱 문제가 발생할 수 있다.)
-- CREATE TRIGGER bi_daily_rentals
-- BEFORE INSERT ON daily_rentals
-- FOR EACH ROW
-- BEGIN
--   IF NEW.rental_date IS NULL THEN -- insert 문에 대여일자 컬럼-값 쌍이 없으면
--     SET rental_date = CURDATE();  -- 대여일자에 오늘 날짜 입력
--   END IF;
-- END;


-- 회원 정보
-- CREATE TABLE users (
--   id CHAR(36) PRIMARY KEY COLLATE utf8mb4_bin, -- UUID
--   name VARCHAR(8) NOT NULL,
--   email VARCHAR(128) UNIQUE,
--   password_hash VARBINARY(60),
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- )
-- CHARACTER SET utf8mb4
-- COLLATE utf8mb4_0900_ai_ci;
