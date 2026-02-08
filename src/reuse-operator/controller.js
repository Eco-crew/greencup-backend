const service = require('./service');

function getRequests(req, res) {
  try {
    const requests = service.getRequests();
    // 진행중
  } catch (err) {
    next(err);
  }
}

module.exports = { getRequests };
