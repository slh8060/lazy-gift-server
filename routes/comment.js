const express = require('express');
const router = express.Router();
//导入mysql模块
const mysql = require('mysql');
const dbConfig = require('../db/dbConfig');
const commentSQL = require('../db/commentSQL');
const userSQL = require('../db/userSQL');
const giftSQL = require('../db/giftSQL');

//导入 util
const DbUtil = require('../utils/DbUtil');
const routerMiddle = require('../utils/RouterUtil').routerMiddle();
const commonUtil = require('../utils/CommonUtil');


let dbUtil = new DbUtil();

// router.use(routerMiddle);


router.get('/gift.json', function (req, res, next) {
  res.render('gift');
});

//评论列表
router.post('/commentList.json', function (req, res) {
  let param = req.body,
    detailId = param.detailId,
    results = {};
  dbUtil.query(commentSQL.selectComment, detailId, function (result) {  //评论回复查询
    results = result;
    var callback = new commonUtil.AsyncCallback(result.length, function () {
      res.send(results);
    });

    result.forEach(function (item, index) {
      dbUtil.query(commentSQL.selectReply, item.id, function (result) {
        console.log('----',index,item);
        if (result.length != 0) {
          results[index].reply = result;
        }
        callback.exect();
      });

    });


  });

});


//评论
router.post('/comment.json', function (req, res) {

  let param = req.p,
    detailId = param.detailId,
    ownerUserId = param.ownerUserId,
    targetUserId = param.targetUserId,
    content = param.content,
    parentId = param.parentId,
    rootId = param.rootId,
    results = {}, commentId,
    targetTableName = "message_comment";
  let callback = new commonUtil.AsyncCallback(1, function () {
    dbUtil.query(commentSQL.insertMessageComment, commentId, function (result) {
      let messageCommentId = result.insertId;

      dbUtil.query(commentSQL.insertMyMessage, [targetUserId, messageCommentId, targetTableName], function (result) {
        results.success = true;
        results.commentId = commentId;
        results.rootId = commentId;
        res.send(results);

      })
    })
  });

  if (typeof parentId == "undefined") {  //评论
    dbUtil.query(commentSQL.insertComment, [detailId, ownerUserId, targetUserId, content], function (result) {
      commentId = result.insertId;
      results.rootId = result.insertId;
      callback.exect();

    });
  } else {  //回复
    dbUtil.query(commentSQL.insertCommentReply, [detailId, ownerUserId, targetUserId, parentId, rootId, content], function (result) {
      commentId = result.insertId;
      results.rootId = rootId;
      callback.exect();
    })

  }


  // if (typeof targetUserId == "undefined"){  //评论
  //   dbUtil.query(giftSQL.selectDetailOne,detailId,function (result) {
  //     targetUserId = result[0].user_id;
  //     dbUtil.query(commentSQL.insertComment,[detailId,ownerUserId,targetUserId,content],function (result) {
  //       rerults.ownerUserId = ownerUserId;
  //       rerults.targetUserId = targetUserId;
  //       rerults.commentId = result.insertId;
  //       dbUtil.query(commentSQL.insertMyMessage, [targetUserId, targetTableId, targetTableName], function (result) {
  //           dbUtil.query(commentSQL.insertMessageComment, [detailId,ownerUserId, targetUserId], function (result) {
  //             rerults.success = true;
  //             res.send(rerults);
  //
  //           })
  //         });
  //
  //
  //     });
  //
  //   });
  //
  //
  // } else {   //回复
  //   dbUtil.query(commentSQL.insertCommentReply,[detailId,ownerUserId,targetUserId,parentId,content],function (result) {
  //     rerults.ownerUserId = ownerUserId;
  //     rerults.commentId = result.insertId;
  //     rerults.targetUserId = targetUserId;
  //     dbUtil.query(commentSQL.insertMyMessage, [targetUserId,targetTableId,targetTableName], function (result) {
  //       dbUtil.query(commentSQL.insertMessageComment,[detailId,ownerUserId,targetUserId], function (result) {
  //         rerults.success = true;
  //         res.send(rerults);
  //       })
  //     });
  //   });
  // }


});


module.exports = router;
