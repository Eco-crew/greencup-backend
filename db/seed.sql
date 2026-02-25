USE greencup;

-- 재사용 컵 업체 테이블 샘플 데이터
INSERT INTO greencup_branches VALUES(UUID(), 'seongdong@greencup.co.kr', '공수거', '01054326987', '$2b$10$jD9szVjKgf2JK2ikuHCGgOb.0pKaHp1gmmBjGohiobC7PGS7qkoTq', 'Local', '그린컵 성동점', 5000, 5000, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: 523f7925-0038-11f1-a40e-1295856e2c3b
INSERT INTO greencup_branches VALUES(UUID(), 'dongdaemun@greencup.co.kr', '공수래', '01096285252', '$2b$10$679rRfVNW7u.fuozuh.k9e62zEJjzjKkM.TPR5LlcTjb7EdqlCiy6', 'Local', '그린컵 동대문점', 6977, 3577, 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: f4517ddd-0038-11f1-a40e-1295856e2c3b


-- 제휴업체 테이블 샘플 데이터
-- Template:
-- INSERT INTO partners VALUES(UUID(), 'email_address', 'manager_name', 'manager_nickname', 'phone_number', 'site_name', 'real_site_address', '07:00:00', '23:00:00', 0, '$2b$10$eVzInbcr641XyqQldA6/pOdiMT1FSCNp.gJoe4rzil3wY.lDHRL42', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO partners VALUES(UUID(), 'manager@jehyu.co.kr', '김제휴', NULL, '01056436722', '제휴업체1호점', '서울시 성동구 용답동 228-5', '10:00:00', '18:00:00', 3, '$2b$10$IkyAhaiFoLbp.yNwChi7zOGAD0kr2AsB6ufPnXzqvMyKVQvM8ryKO', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: 6415ddc9-003a-11f1-a40e-1295856e2c3b
INSERT INTO partners VALUES(UUID(), 'insta@starbucks.co.kr', '인스타', 'insta', '01056436722', '스타벅스 장한평역점', '서울시 동대문구 장한로 10', '07:00:00', '22:00:00', 0, '$2b$10$ZmhHnKCrPTgfZL5c4DKNouo1Vllyxy0PA7sofxhZdHB7tH8DkFR.i', 'Local', 'cafe', 'f4517ddd-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: f7df4f97-003a-11f1-a40e-1295856e2c3b
INSERT INTO partners VALUES(UUID(), 'yhr@sesac.or.kr', '류영한', 'Ryu', '0223273925', '청년취업사관학교 성동캠퍼스', '서울 성동구 용답19길 3-1', '07:00:00', '23:00:00', 0, '$2b$10$eVzInbcr641XyqQldA6/pOdiMT1FSCNp.gJoe4rzil3wY.lDHRL42', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: d3255b57-0123-11f1-a40e-1295856e2c3b
INSERT INTO partners VALUES(UUID(), 'contact@sd.go.kr', '성동구청', 'seongdong', '0222895114', '성동구청', '서울시 성동구 고산자로 270','09:00:00', '18:00:00', 3, '$2b$10$yTnGUy376QT2h35/HZsMz.K5dxh5i/Qq2Yc0RbMe.qharYSiNxpsq', 'Local', 'public', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: d37c647e-0123-11f1-a40e-1295856e2c3b
INSERT INTO partners VALUES(UUID(), 'hello@coworkseoul.co.kr', '코워크', 'cowork', '0212349876', '코워크서울 성수점', '서울시 성동구 연무장길 57', '09:00:00', '21:00:00', 1, '$2b$10$FRBi.NkF5DkDPJt4JJUIC.hYmxw.8aGc6zEsOO8Y2YSRu9qsMUQAa', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: 0fe6c42b-0124-11f1-a40e-1295856e2c3b
INSERT INTO partners VALUES(UUID(), 'bricks@heyground.com ', '허재형', NULL, '01048271936', '헤이그라운드 성수 시작점', '서울 성동구 뚝섬로1나길 5', '11:00:00', '19:00:00', 3, '$2b$11$5ZlFw2Q/5Ih1WVMjBgxsjObmu42HfxgXkzUDdylMUumMXvjMxox2m', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'seoulforest@heyground.com', '김이서', NULL, '01075912843', '헤이그라운드 서울숲점', '서울시 동대문구 장한로 10', '09:00:00', '22:00:00', 3, '$2b$11$4uWiNOWYeVeIaGg1eVRAcOo5RKXM8LYnCcOVM/zrzQVoav4IqOyca', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'manager@hellomonday.co.kr', '이다혜', NULL, '01089425617', '헬로먼데이 코너25 성수일로점', '서울 성동구 성수일로1길 1', '07:00:00', '24:00:00', 0, '$2b$11$Jqi4umeKu3hcHq9ORRqlKeCroL6G8RcHp2o/io6JuvFhgKFRko8Wq', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'daeil@fastfive.co.kr', '김대일', NULL, '01023796481', '패스트파이브 서울숲점', '서울 성동구 성수동1가 656-292', '07:00:00', '24:00:00', 0, '$2b$11$2T.7TQo3GlDfVw0mwliznO/.DSkcIpy8tvxx2d0KW4lECWx.biVIa', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'manager@fastfive.co.kr', '이호', NULL, '01066531298', '패스트파이브 성수1호점', '서울 성동구 성수동2가 301-94', '07:00:00', '24:00:00', 0, '$2b$11$1H9XN8neiaP1ICCYBhHYSOBFTmkQ0ziyzr.2Ihx4BbE8aurVF/vS.', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'taeri@mrsunshine.co.kr', '김태리', NULL, '01017846932', '미스터 션샤인', '서울 성동구 자동차시장1길 64', '06:00:00', '22:00:00', 0, '$2b$11$Pcb2RHNEGpH4oylhX6.3o.X9vPxJDdfgziueLQLjesY0v0x9HYqMy', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'musinsastudio@musinsa.com', '박준모', NULL, '01052384701', '무신사스튜디오 성수점', '서울 성동구 아차산로 104 5층', '06:00:00', '24:00:00', 0, '$2b$11$gKh4B8.G.pmVmDF3UnyLTud4mUQAqOCC2iLN8SNuP4XRuOO5OTu3W', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- public
INSERT INTO partners VALUES(UUID(), 'email_address', 'manager_name', NULL, '01094073526', 'site_name', 'real_site_address', '07:00:00', '23:00:00', 0, '$2b$11$hfP1fg6JrQpEh4emJ3jgRufm60K1m1VBxiVV9pgJ3AKT84lGHwG6i', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'email_address', 'manager_name', NULL, '01031649075', 'site_name', 'real_site_address', '07:00:00', '23:00:00', 0, '$2b$11$N02ivaRmZkO.I.ik4fH9F.VfItWWawbUG/ZzB8crp3avlVD3vzJYy', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO partners VALUES(UUID(), 'email_address', 'manager_name', NULL, '01080462159', 'site_name', 'real_site_address', '07:00:00', '23:00:00', 0, '$2b$11$rTSNQm.naYQlSlQM0PCO7uTwKVcxwhhqy/P2M845j0iyU.WKZlN8S', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 성동소방서 소방서
-- 성동세무서 세무서
-- 서울성동경찰서 경찰서
-- 벤처씨드 용답점

-- office
INSERT INTO partners VALUES(UUID(), 'email_address', 'manager_name', NULL, '01039175824', 'site_name', 'real_site_address', '07:00:00', '23:00:00', 0, '$2b$11$745zmwSuSCtkkpw25fbQpema9xvjoalLg8m31azEMGszsxsJlQ4l.', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 비밀번호 hash 바꿀 때 이용할 쿼리:
-- update partners set password_hash='$2b$10$K/And106a/SuyUWFavob2.FKXTXbnFr5I8ZD7lxMY56sbVQtaxtFe' where manager_name='김제휴';
-- update partners set password_hash='$2b$10$Vz2km3Nzh1blLFdiHbXryuOlNJ0ToHv1msDRs0S8eLAhDtGv16J.i' where manager_name='인스타';

-- update greencup_branches set password_hash='$2b$10$K5W2x6HQ.43qLTL34loq4.c9kdAGzvPh9VpZXgXtqpudwajWuRgLq' where manager_email='seongdong@greencup.co.kr';
-- update greencup_branches set password_hash='$2b$10$03CAVSI93H09oYSUCoTnh.cWeyGYh/BWOSUPixK5u5K90YoCaLsRa' where manager_email='dongdaemun@greencup.co.kr';


-- 계약 테이블 샘플 데이터
-- Template:
-- INSERT INTO contracts VALUES('2020-00-01', '2020-00-00', 000, '09:00:00', '523f7925-0038-11f1-a40e-1295856e2c3b', 'UUID', '비고란', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO contracts VALUES('2026-02-01', '2027-01-31', 300, '09:00:00', '523f7925-0038-11f1-a40e-1295856e2c3b', '6415ddc9-003a-11f1-a40e-1295856e2c3b', '8시 전에는 사람 없습니다.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 제휴업체1호점
INSERT INTO contracts VALUES('2026-02-01', '2026-04-30', 500, '06:30:00', 'f4517ddd-0038-11f1-a40e-1295856e2c3b', 'f7df4f97-003a-11f1-a40e-1295856e2c3b', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 스타벅스 장한평역점
INSERT INTO contracts VALUES('2026-01-01', '2026-12-31', 180, '06:30:00', '523f7925-0038-11f1-a40e-1295856e2c3b', 'd3255b57-0123-11f1-a40e-1295856e2c3b', '입구에서 호출 버튼 눌러주세요.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 청년취업사관학교 성동캠퍼스
INSERT INTO contracts VALUES('2026-03-01', '2026-08-30', 500, '07:00:00', '523f7925-0038-11f1-a40e-1295856e2c3b', 'd37c647e-0123-11f1-a40e-1295856e2c3b', '비품창고에 입고 부탁드립니다.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 성동구청
INSERT INTO contracts VALUES('2026-01-01', '2026-01-31', 150, '08:00:00', '523f7925-0038-11f1-a40e-1295856e2c3b', '0fe6c42b-0124-11f1-a40e-1295856e2c3b', '현관에서 전화해주세요', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 코워크서울 성수점


-- 비정기 휴일 테이블 샘플 데이터
INSERT INTO special_closed_dates VALUES('d3255b57-0123-11f1-a40e-1295856e2c3b', '2026-01-05', '병원', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 청년취업사관학교 성동캠퍼스
INSERT INTO special_closed_dates VALUES('6415ddc9-003a-11f1-a40e-1295856e2c3b', '2026-02-04', '워크샵', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 제휴업체1호점


-- 일일 대여요청 테이블 샘플 데이터
-- 제휴업체1호점
INSERT INTO daily_rentals VALUES(UUID(), 300, 300, 5, '2026-02-02', '09:00:00', '523f7925-0038-11f1-a40e-1295856e2c3b', '6415ddc9-003a-11f1-a40e-1295856e2c3b', 'complete', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO daily_rentals VALUES(UUID(), 300, 300, 5, '2026-02-03', '08:30:00', '523f7925-0038-11f1-a40e-1295856e2c3b', '6415ddc9-003a-11f1-a40e-1295856e2c3b', 'incomplete', '아침 행사가 있어서 30분만 일찍 와주세요', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO daily_rentals VALUES(UUID(), 300, 300, 5, '2026-02-04', '09:00:00', '523f7925-0038-11f1-a40e-1295856e2c3b', '6415ddc9-003a-11f1-a40e-1295856e2c3b', 'cancelled', '연락이 늦었네요. 워크샵이 있어서 오늘은 취소할게요', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
