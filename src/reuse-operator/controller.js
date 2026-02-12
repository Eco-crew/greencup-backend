const service = require('./service');

function getRequests(req, res) {
  try {
    const requests = service.getRequests();
    // 진행중
  } catch (err) {
    next(err);
  }
}

































/**
 *  수거지점장- 업체관리 영역
*/

//수거지점장- 업체관리 - 리스트
async function reuseOperatorPartnerList (req, res, next){
  const {partnerName, page, pageRowSize} = req.query;

  //로그인한 당사자인 수거지점장의 uuid를 가져옴
  const reuseOperatorId = req.session.user.id;

  try{
    const reusePartnerList = await service.reuseOperatorPartnerList(reuseOperatorId, Number(page), Number(pageRowSize) , partnerName);
    res.json(reusePartnerList);
  } catch(err){
    next(err);
  }

}

//수거지점장- 업체관리 - 업체 상세
async function reuseOperatorPartnerDetail (req, res, next){
  const {partnerId} = req.params;

  try{
    const reusePartner = await service.reuseOperatorPartnerDetail(partnerId);
    res.json(reusePartner);
  } catch(err){
    next(err);
  }

}


module.exports = { getRequests, reuseOperatorPartnerList, reuseOperatorPartnerDetail };
