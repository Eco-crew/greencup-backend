// Business Logic
const path = require('path');
const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true
});
const repository = require('./repository');
const AuthError = require('../errors/AuthError');
const AppError = require('../errors/AppError');
































/**
 *  수거지점장- 업체관리 영역
*/

//수거지점장- 업체관리 - 리스트
async function reuseOperatorPartnerList(reuseOperatorId, page, pageRowSize, partnerName) {
  //수거지점장- 업체목록 - 리스트- 페이지네이션 데이터를 받아온다
  const partnerList = await repository.reuseOperatorPartnerList(reuseOperatorId, page, pageRowSize, partnerName);

  //배열을 돌며 키이름을 프론트에서 데이터를 받는 형태로 바꿔준다.
  let changeNamePartnerList = [];
  partnerList.forEach((partner) => {
    let changeNamePartnerObject = {};
    for (const [key, value] of Object.entries(partner)) {
      switch (key) {
        case "partner_id":
          changeNamePartnerObject.partnerId = value;
          break;
        case "site_name":
          changeNamePartnerObject.partnerName = value;
          break;
        case "manager_name":
          changeNamePartnerObject.partnerManagerName = value;
          break;
        case "rented_sum":
          changeNamePartnerObject.rentedSum = value;
          break;
        case "returned_sum":
          changeNamePartnerObject.returnedSum = value;
          break;
        case "lost_sum":
          changeNamePartnerObject.lostSum = value;
          break;
        default:
          break;

      }
    }

    changeNamePartnerList.push(changeNamePartnerObject);
  });

  //여기서 현재 보유중인 컵수를 구한다
  //전체 대여수 - 전체 반납수 - 전체 파손수
  let resultPartnerList = [];
  changeNamePartnerList.forEach((partner) => {
    let changeNamePartnerObject = {};
    const currentLoanCount = partner.rentedSum - partner.returnedSum - partner.lostSum;

    //이 키값들만 제거한 객체를 대입후, 현재 보유중인 컵수 속성을 넣는다
    const { rentedSum, returnedSum, lostSum, ...rest } = partner;
    changeNamePartnerObject = rest;
    changeNamePartnerObject.currentLoanCount = currentLoanCount;

    resultPartnerList.push(changeNamePartnerObject);
  });

  //수거지점장- 업체목록 - 리스트- 전체개수 데이터를 받아온다
  let partnerCount = await repository.reuseOperatorPartnerListCount(reuseOperatorId, partnerName)
  return { partners: resultPartnerList, searchPartnerCount: partnerCount };
}

//수거지점장 - 업체관리 - 업체상세
async function reuseOperatorPartnerDetail(partnerId) {

}


module.exports = {reuseOperatorPartnerList, reuseOperatorPartnerDetail };