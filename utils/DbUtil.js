//导入mysql模块
const mysql = require('mysql');
const dbConfig = require('../db/dbConfig');

// 使用DBConfig.js的配置信息创建一个MySQL连接池
const pool = mysql.createPool(dbConfig.mysql);


class DbUtil {
  constructor() {
    this.connection = null;
    this.count = 0;
    this.isRelease = false;
  }

  /**
   *
   * @param sql ggg
   * @param param
   * @param callback(result)
   * @param errCallback(err)
   */
  query(sql, param, callback, errCallback) {
    this.count++;
    let that = this;
    if (this.connection == null) {
      pool.getConnection(function (err, connection) {
        that.connection = connection;
        that.exect(sql, param, callback, errCallback);
      });
    } else {
      that.exect(sql, param, callback, errCallback);
    }
  }

  exect(sql, param, callback, errCallback) {
    this.connection.query(sql, param, function (err, result) {
        if (!err) {
          callback(result);
        } else {
          if (typeof errCallback == "function")
            errCallback(err);
        }
      this.count--;
      if (this.isRelease) {
        this.release();
      }
    });
  }

  release() {
    this.isRelease = true;
    if (this.count <= 0) {
      this.connection.release();
    }
  }
}


//promise
// function query(connection, sql, param) {
//   return new Promise(function (resolve, reject) {
//     connection.query(sql, param, function (err, result) {
//       if (err)
//         return reject(err);
//       resolve(result);
//     })
//   })
// }

module.exports = DbUtil;
