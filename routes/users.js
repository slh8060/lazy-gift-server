const express = require('express');
const router = express.Router();
const cookie = require('cookie-parser');

//导入mysql模块
const mysql = require('mysql');
const dbConfig = require('../db/dbConfig');

const userSQL = require('../db/userSQL');
const giftSQL = require('../db/giftSQL');
const commentSQL = require('../db/commentSQL');

//导入 util
const DbUtil = require('../utils/DbUtil');
const routerMiddle = require('../utils/RouterUtil').routerMiddle();
const giftUtil = require('../utils/GiftUtil');
const commonUtil = require('../utils/CommonUtil');

const pool = mysql.createPool(dbConfig.mysql);

let dbUtil = new DbUtil();

router.use(routerMiddle);


router.get('/login.json', function (req, res, next) {
  res.render('login')
});


router.post('/login.json', function (req, res, next) {
  //let paramStr = new Buffer(req.body.p, 'base64').toString();//Base64解码,结果为：{"username":"qzsang","password":"123456"}
  // let param = JSON.parse(paramStr);//Json 字符串转为对象
  let param = req.body;

  let userName = param.username;
  let userPwd = param.userpwd;
  let userToken = req.cookies.user_session || req.get('user_token');
  let results = {};

  let cookie = req.cookies;
  console.log('---cookie---',cookie);
  console.log('11111', userToken);


  //缺少参数
  if (userName == undefined || userPwd == undefined || userName == "" || userPwd == "") {
    results.code = 2;
    results.errorMsg = "缺少参数";
    res.send(results);
  } else {
    pool.getConnection(function (err, connection) {
      connection.query(userSQL.selectUserOne, userName, function (err, result) {
        let userId = result[0].id;
        if (result.length != 0) {
          if (result[0].pwd == userPwd) {
            results.code = 200;
            let token = commonUtil.randomWord(false, 43);
            res.cookie('user_session', token, { expires: new Date(Date.now() + 900000), httpOnly: true });

            if (typeof userToken == "undefined") {
            //  let token = commonUtil.randomWord(false, 43);

              connection.query(userSQL.insertUserTokenOne, [token, 1, userId],function (err,result) {
                data = {
                  "username": userName,
                  "userid": userId,
                  "userToken": token
                };
                results.data = new Buffer(JSON.stringify(data)).toString('base64');
              });

            }
          } else {
            results.code = 4;
            results.errorMsg = "用户名或密码错误";
          }
        } else {
          results.code = 3;
          results.errorMsg = "用户名不存在";
        }

        res.send(results);
        connection.release(); // 释放连接

      });
    });
  }
});

router.get('/regist.json', function (req, res, next) {
  res.render('regist');
});

router.post('/regist.json', function (req, res) {
  let paramStr = new Buffer(req.p, 'base64').toString();//Base64解码,结果为：{"username":"qzsang","password":"123456"}
  let param = JSON.parse(paramStr);//Json 字符串转为对象
  let name = param.username;
  let pwd = param.userpwd;
  let results = {};
  pool.getConnection(function (err, connection) {
    connection.query(userSQL.selectUserOne, name, function (err, result) {
      if (result.length != 0) { //用户名已存在
        results.code = 3;
        results.errorMsg = "用户名已存在";
        res.send(results);

      } else {
        connection.query(userSQL.insertUserOne, [name, pwd], function (err, result) {
          results.code = 200;
          data = {
            "username": name,
            "userid": result.insertId
          };
          results.data = new Buffer(JSON.stringify(data)).toString('base64');
          res.send(results);

        })
      }
      connection.release();

    });

  })
});

router.post('/myMessageComment.json', function (req, res) {
  let param = req.body,
    userId = param.userId,
    results = {}, detailId;
  dbUtil.query(userSQL.selectMyMessage, userId, function (result) {
    results.userId = userId;
    results.message = result;
    var callback = new commonUtil.AsyncCallback(result.length, function () {
      res.send(results);

    });
    result.forEach(function (item, index) {
      if (result[index].target_table_name == "message_comment") {
        dbUtil.query(userSQL.selectMessageComment, [result[index].target_table_id], function (result) {
          results.message[index] = result[0];
          detailId = result[0].detail_id;
          let parentId = result[0].parent_id,
            rootId = result[0].root_id;

          dbUtil.query(giftSQL.selectDetailOne, result[0].detail_id, function (result) {
            results.message[index].detail = result[0];

            let now = new Date();  //getTime()  获取的是毫秒数
            let publishDate = result[0].date;
            let differ = (now - publishDate) / 1000;
            results.message[index].detail.date = commonUtil.getTime(differ, publishDate);

            results.message[index].detail.items = [];

            giftUtil.getDetailItem(detailId, function (items) {
              results.message[index].detail.items = items;


              if (parentId != rootId) {
                dbUtil.query(commentSQL.selectCommentOne, parentId, function (result) {
                  results.message[index].lastMessage = result[0];
                  callback.exect();

                })
              } else {
                callback.exect();
              }


            });

          });  //获取详情


        });

      }
    });


  })
});

module.exports = router;
