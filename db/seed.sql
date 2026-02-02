USE greencup;

-- 재사용 컵 업체
INSERT INTO greencup_branches VALUES(UUID(), 'seongdong@greencup.co.kr', '공수거', '01054326987', '$2b$10$HGmUXu7npilydQmHGB1UIeMVD8ysoUYeh2y1QYdJVKOhJp7/AQOo2', 'Local', '그린컵 성동점', 5000, 5000, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: 523f7925-0038-11f1-a40e-1295856e2c3b
INSERT INTO greencup_branches VALUES(UUID(), 'dongdaemun@greencup.co.kr', '공수래', '01096285252', '$2b$10$679rRfVNW7u.fuozuh.k9e62zEJjzjKkM.TPR5LlcTjb7EdqlCiy6', 'Local', '그린컵 동대문점', 6977, 3577, 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: f4517ddd-0038-11f1-a40e-1295856e2c3b


-- 제휴업체
INSERT INTO partners VALUES(UUID(), 'manager@jehyu.co.kr', '김제휴', NULL, '01056436722', '제휴업체1호점', '서울시 성동구 용답동 228-5', '09:00:00', '18:00:00', 3, '$2b$10$IkyAhaiFoLbp.yNwChi7zOGAD0kr2AsB6ufPnXzqvMyKVQvM8ryKO', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: 6415ddc9-003a-11f1-a40e-1295856e2c3b
INSERT INTO partners VALUES(UUID(), 'insta@starbucks.co.kr', '인스타', 'insta', '01056436722', '스타벅스 장한평역점', '서울시 동대문구 장한로 10', '07:00:00', '22:00:00', 0, '$2b$10$ZmhHnKCrPTgfZL5c4DKNouo1Vllyxy0PA7sofxhZdHB7tH8DkFR.i', 'Local', 'Cafe', 'f4517ddd-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- id: f7df4f97-003a-11f1-a40e-1295856e2c3b
INSERT INTO partners VALUES(UUID(), '', '', 'insta', '01056436722', '벤처씨드 용답점', '서울 성동구 용답19길 3-1', '07:00:00', '23:00:00', 0, '$2b$10$eVzInbcr641XyqQldA6/pOdiMT1FSCNp.gJoe4rzil3wY.lDHRL42', 'Local', 'office', '523f7925-0038-11f1-a40e-1295856e2c3b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);



$2b$10$yTnGUy376QT2h35/HZsMz.K5dxh5i/Qq2Yc0RbMe.qharYSiNxpsq
$2b$10$FRBi.NkF5DkDPJt4JJUIC.hYmxw.8aGc6zEsOO8Y2YSRu9qsMUQAa