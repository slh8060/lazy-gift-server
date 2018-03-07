const express = require('express');
const router = express.Router();

//导入mysql模块
const mysql = require('mysql');
const dbConfig = require('../db/dbConfig');

const pool = mysql.createPool(dbConfig.mysql);

const userSQL = require('../db/userSQL');

const routerUtil = require('../utils/RouterUtil');
const commonUtil = require('../utils/CommonUtil');

/* GET home page. */
router.use(routerUtil.routerMiddle());

router.get('/login', function (req, res, next) {
  let param = req.p,
    userToken = req.get('user_token'),
    results = {};


  pool.getConnection(function (err, connection) {
    if (typeof userToken != "undefined") {
      connection.query(userSQL.selectUserTokenOne, userToken, function (err, result) {
        console.log(result);

        let last_login = result[0].last_login;
        let nowtime = new Date();

        if (nowtime - last_login > 7 * 24 * 60 * 60){   //过期

        }
      });

    } else {

    }
  });

});


module.exports = router;
