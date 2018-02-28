const giftSQL = require('../db/giftSQL');
const DbUtil = require('../utils/DbUtil');
let dbUtil = new DbUtil();


function getDetailItem(detailId, callback) {
  dbUtil.query(giftSQL.selectDetailItem, detailId, function (result) {
    let items = [];
    if (result.length != 0) {
      for (let j = 0; j < result.length; j++) {
        let item = {};
        item.detail_level = result[j].detail_level;
        item.brief = result[j].brief;
        item.content = result[j].content;
        items.push(item);
      }
    }
    callback(items);
  });
}

function getOneIsApprove(param, callback) {
    dbUtil.query(giftSQL.selectDetailOneIsApprove, param, function (result) {
      (result.length == 0) ? is_approve = 0 : is_approve = result[0].is_approve;
      callback(is_approve);
    })
}

module.exports = {
  getDetailItem: getDetailItem,
  getOneIsApprove: getOneIsApprove
};


