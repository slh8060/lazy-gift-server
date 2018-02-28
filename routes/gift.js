const express = require('express');
const router = express.Router();
//导入mysql模块
const mysql = require('mysql');
const dbConfig = require('../db/dbConfig');
const giftSQL = require('../db/giftSQL');
const userSQL = require('../db/userSQL');

//导入 util
const DbUtil = require('../utils/DbUtil');
const routerMiddle = require('../utils/RouterUtil').routerMiddle();
const giftUtil = require('../utils/GiftUtil');
const commonUtil = require('../utils/CommonUtil');

const pool = mysql.createPool(dbConfig.mysql);

let dbUtil = new DbUtil();

//router.use(routerMiddle);


// router.get('/gift.json',RouterUtil.getFunction(function (req, res) {
//   res.render('gift');
// }));

router.get('/gift.json', function (req, res, next) {
  res.render('gift');
});


//详情
router.post('/detail.json', function (req, res) {
  let param = req.body;//JSON.parse(req.body.p);
  let detailId = param.detailId,
    userId = param.userId,
    results = {};

  dbUtil.query(giftSQL.selectDetailOne, detailId, function (result) {
    results.success = true;
    results.result = result[0];

    let now = new Date();  //getTime()  获取的是毫秒数
    let publishDate = result[0].date;
    let differ = (now - publishDate)/1000;
    result[0].date = commonUtil.getTime(differ,publishDate);

    results.result.items = [];

    giftUtil.getDetailItem(detailId, function (items) {
      results.result.items = items;

      if (typeof userId != "undefined") {
        giftUtil.getOneIsApprove([detailId, userId], function (is_approve) {
          results.result.is_approve = is_approve;
          res.send(results);
        });
      } else {
        results.result.is_approve = 0;
        res.send(results);
      }
    });

    // dbUtil.query(giftSQL.selectDetailItem, detailId, function (result) {
    //   let items = [];
    //   for (let i = 0; i < result.length; i++) {
    //     let item = {};
    //     item.detail_level = result[i].detail_level;
    //     item.brief = result[i].brief;
    //     item.content = result[i].content;
    //     items.push(item);
    //   }
    //   results.result[0].items = items;
    //   if (typeof userId != "undefined") {
    //     dbUtil.query(giftSQL.selectDetailOneIsApprove, [detailId, userId], function (result) {
    //       results.result[0].is_approve = result[0].is_approve;
    //       res.send(results);
    //     })
    //   } else {
    //     results.result[0].is_approve = 0;
    //     res.send(results);
    //   }
    // });
  });
  dbUtil.release();

  // pool.getConnection(function (err, connection) {
  //   query(connection, giftSQL.selectDetailOne, detailId).then(result => {
  //     results.success = true;
  //     results.result = result;
  //     results.result[0].items = [];
  //     query(connection, giftSQL.selectDetailItem, detailId).then(result => {
  //       let items = [];
  //       for (let i = 0; i < result.length; i++) {
  //         let item = {};
  //         item.detail_level = result[i].detail_level;
  //         item.brief = result[i].brief;
  //         item.content = result[i].content;
  //         items.push(item);
  //       }
  //       results.result[0].items = items;
  //       if (typeof userId != "undefined") {
  //         query(connection, giftSQL.selectDetailOneIsinterest, [detailId, userId]).then(result => {
  //           results.result[0].is_approve = result[0].is_approve;
  //           res.send(results);
  //           connection.release();
  //         })
  //       } else {
  //         results.result[0].is_approve = 0;
  //         res.send(results);
  //         connection.release();
  //       }
  //     });
  //   }).catch(err => {
  //     results.success = false;
  //     results.message = err.message;
  //     res.send(results);
  //     connection.release();
  //
  //   })
  // });

  // pool.getConnection(function (err, connection) {
  //   connection.query(giftSQL.selectDetailOne, detailId, function (err, result) {
  //     if (err) {
  //       results.success = false;
  //       results.message = err.message;
  //     } else {
  //       results.success = true;
  //       results.result = result;
  //       results.result[0].items = [];
  //       connection.query(giftSQL.selectDetailItem, detailId, function (err, result) {
  //         let items = [];
  //         for (let i = 0; i < result.length; i++) {
  //           let item = {};
  //           item.detail_level = result[i].detail_level;
  //           item.brief = result[i].brief;
  //           item.content = result[i].content;
  //           items.push(item);
  //         }
  //         results.result[0].items = items;
  //
  //         if (typeof userId != "undefined") {
  //           connection.query(giftSQL.selectDetailOneIsinterest,[detailId, userId],function (err,result) {
  //             results.result[0].is_approve = result[0].is_approve;
  //             res.send(results);
  //           })
  //         } else {
  //           results.result[0].is_approve = 0;
  //           res.send(results);
  //         }
  //       });
  //     }
  //     connection.release();
  //   })
  // })
});


//推荐
router.post('/recommend.json', function (req, res) {
  let param = req.body,//JSON.parse(req.body.p);
    start = param.start,
    limit = 20, //param.limit,
    userId = param.userId,
    firstTime, results = {};
  console.log('zzzzz',start,userId);

  if (typeof param.firstTime != "undefined") {
    firstTime = param.firstTime;
  } else {
    firstTime = new Date();
  }
  dbUtil.query(giftSQL.selectDetailAll, [firstTime, (start - 1) * limit, limit], function (result) {
    if (result.length == 0) {
      results.success = false;
      results.message = "没有更多数据";
      res.send(results);
    } else {
      results.success = true;
      results.firstTime = firstTime;
      results.result = result;

      let now = new Date();  //getTime()  获取的是毫秒数

      var callback = new commonUtil.AsyncCallback(result.length, function () {
        res.send(results);
      });
      for (let i = 0; i < result.length; i++) {
        let items = [];
        let detailId = result[i].id;
        let publishDate = result[i].date;
        let differ = (now - publishDate)/1000;
        result[i].date = commonUtil.getTime(differ,publishDate);

        giftUtil.getDetailItem(result[i].id, function (items) {
          results.result[i].items = items;
          results.result[i].is_approve = 0;
          if (typeof userId != "undefined") {
            giftUtil.getOneIsApprove([detailId, userId], function (is_approve) {
              results.result[i].is_approve = is_approve;
              callback.exect();
            })
          } else {
            callback.exect();
          }
        })
      }
    }
  });
  dbUtil.release();


  // pool.getConnection(function (err, connection) {
  //   connection.query(giftSQL.selectDetailAll, [firstTime, (start - 1) * limit, limit], function (err, result) {
  //     if (err) {
  //       results.success = false;
  //       results.message = err.message;
  //       res.send(results);
  //     } else {
  //
  //       if (result.length == 0) {
  //         results.cuccess = false;
  //         results.message = "没有更多数据";
  //         res.send(results);
  //       } else {
  //         results.success = true;
  //         results.firstTime = firstTime;
  //         results.result = result;
  //
  //         var callback = new AsyncCallback(result.length, function () {
  //           res.send(results);
  //           connection.release();
  //         });
  //
  //         for (let i = 0; i < result.length; i++) {
  //           let items = [];
  //           connection.query(giftSQL.selectDetailItem, result[i].id, function (err, result) {
  //             if (result.length != 0) {
  //               for (let j = 0; j < result.length; j++) {
  //                 let item = {};
  //                 item.detail_level = result[j].detail_level;
  //                 item.brief = result[j].brief;
  //                 item.content = result[j].content;
  //                 items.push(item);
  //               }
  //               results.result[i].items = items;
  //
  //               if (typeof userId != 'undefined') {
  //                 connection.query(giftSQL.selectDetailOneIsinterest, [result[i].id, userId], function (err, result) {
  //                   console.log('------', result);
  //                   console.log(result.is_approve);
  //                   // results.result[i].is_approve = result[0].is_approve;
  //                 })
  //               } else {
  //                 results.result[i].is_approve = 0;
  //               }
  //             } else {
  //               results.result[i].items = [];
  //             }
  //             callback.exect();
  //           });
  //         }
  //       }
  //     }
  //   })
  // });
});

//发布
router.post('/publish.json', function (req, res) {
  let param = req.p;//JSON.parse(req.body.p);
  let items = param.items;
  let results = {};
  dbUtil.query(userSQL.selectUserOne, param.uname, function (result) {
    dbUtil.query(giftSQL.insertDetailOne, [result[0].id, param.title, new Date()], function (result) {
      results.detailId = result.insertId;
      var callback = new commonUtil.AsyncCallback(items.length, function () {
        res.send(results);
      });
      for (let i = 0; i < items.length; i++) {
        dbUtil.query(giftSQL.insertDetailItem, [result.insertId, items[i].brief, items[i].detail_level, items[i].content], function (result) {
          results.success = true;
          callback.exect();
        });
      }
    })
  });
  dbUtil.release();
});

//赞\不赞
router.post('/approve.json', function (req, res) {
  let param = req.body;//JSON.parse(req.body.p);
  let userId = param.userId,
    detailId = param.detailId,
    isApprove = param.isApprove,
    results = {};

  dbUtil.query(giftSQL.selectDetailOneIsApprove, [detailId, userId], function (result) {
    if (result.length != 0) {
      let beforeIsApprove = result[0].is_approve;
      if (result[0].is_approve == isApprove) {
        results.success = true;
        results.isApprove = result[0].is_approve;
        results.detailId = detailId;
        switch (result[0].is_approve) {
          case 0:
            results.message = "您没有任何评价";
            break;
          case 1:
            results.message = "已赞";
            break;
          case -1:
            results.message = "已丢过大便";
            break;
          default:
        }
        res.send(results);
      } else {
        dbUtil.query(giftSQL.updateDetailApprove, [isApprove, userId, detailId], function (result) {
          if (isApprove == 1) {
            dbUtil.query(giftSQL.addApproveNum, detailId, function (result) {
              //不作任何评论
              results.success = true;
              results.detailId = detailId;
              results.isApprove = isApprove;
              res.send(results);
            })
          } else if (isApprove == -1) {
            dbUtil.query(giftSQL.addUnapproveNum, detailId, function (result) {
              //不作任何评论
              results.success = true;
              results.detailId = detailId;
              results.isApprove = isApprove;
              res.send(results);
            })
          } else {
            beforeIsApprove == 1 ? dbUtil.query(giftSQL.subApproveNum, detailId, function (result) {
              //不作任何评论
              results.success = true;
              results.detailId = detailId;
              results.isApprove = isApprove;
              res.send(results);
            }) : dbUtil.query(giftSQL.subUnapproveNum, detailId, function (result) {
              //不作任何评论
              results.success = true;
              results.detailId = detailId;
              results.isApprove = isApprove;
              res.send(results);
            })
          }

        });
      }
    } else {
      dbUtil.query(giftSQL.insertDetailApprove, [userId, detailId, isApprove], function (result) {
        isApprove == 1 ? dbUtil.query(giftSQL.addApproveNum, detailId, function (result) {
          results.success = true;
          results.isApprove = isApprove;
          results.detailId = detailId;
          res.send(results);
          }) : dbUtil.query(giftSQL.addUnapproveNum, detailId, function (result) {
          results.success = true;
          results.isApprove = isApprove;
          results.detailId = detailId;
          res.send(results);
        });

      });
    }

  });

});

//收藏接口
router.post('/collect.json', function (req, res) {
  let param = JSON.parse(req.body.p),
    userId = param.userId,
    detailId = param.detail_id,
    isCollect = param.is_collect;
  results = {};

  //收藏
  if (isCollect) {
    dbUtil.query(giftSQL.selectCollectOne, [userId, detailId], function (result) {
      if (result.length == 0) {
        dbUtil.query(giftSQL.insertCollectOne, [userId, detailId], function (result) {
          results.success = true;
          res.send(results);
        })
      } else {
        results.success = false;
        results.message = "已收藏";
        res.send(results);
      }
    })
  } else {    //取消收藏
    dbUtil.query(giftSQL.deleteCollectone, [userId, detailId], function (result) {
      results.success = true;
      res.send(results);
    })

  }
});

//收藏列表接口
router.post('/collectList.json', function (req, res) {
  let param = req.body,
    userId = param.userId,
    results = {};

  dbUtil.query(giftSQL.selectCollectAll, userId, function (result) {
    results.result = [];
    if (result.length != 0) {
      var callback = new commonUtil.AsyncCallback(result.length, function () {
        res.send(results);
      });
      for (let i = 0; i < result.length; i++) {
        let detailId = result[i].detail_id;
        dbUtil.query(giftSQL.selectDetailOne, detailId, function (result) {
          results.success = true;
          results.result = result;

          let now = new Date();  //getTime()  获取的是毫秒数
          let publishDate = result[i].date;
          let differ = (now - publishDate)/1000;
          result[i].date = commonUtil.getTime(differ,publishDate);

          results.result[0].items = [];
          //throw new Error("999");

          giftUtil.getDetailItem(detailId, function (items) {
            results.result[i].items = items;
            results.result[i].is_approve = 0;
            if (typeof userId != "undefined") {
              giftUtil.getOneIsApprove([detailId, userId], function (is_approve) {
                results.result[i].is_approve = is_approve;
                callback.exect();
              })
            } else {
              callback.exect();
            }
          })

          // dbUtil.query(giftSQL.selectDetailItem, detailId, function (result) {
          //   let items = [];
          //   for (let i = 0; i < result.length; i++) {
          //     let item = {};
          //     item.detail_level = result[i].detail_level;
          //     item.brief = result[i].brief;
          //     item.content = result[i].content;
          //     items.push(item);
          //   }
          //   results.result[0].items = items;
          //   if (typeof userId != "undefined") {
          //     dbUtil.query(giftSQL.selectDetailOneIsApprove, [detailId, userId], function (result) {
          //       results.result[0].is_approve = result[0].is_approve;
          //       res.send(results);
          //     })
          //   } else {
          //     results.result[0].is_approve = 0;
          //     res.send(results);
          //   }
          // });

        })
      }
    }
    results.success = true;

  });


});


module.exports = router;
