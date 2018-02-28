const express = require('express');
const router = express.Router();


function routerMiddle() {
  return function timeLog(req, res, next) {
    if (req.method == "POST"){
      req = req.body;
    }
      // req.p = JSON.parse(req.body);
    next();
  };
}


module.exports = {
  routerMiddle: routerMiddle
};


function getFunction(callback) {

  return function (req, res, next) {

    callback(req, res);
  };
}


function postFunction(callback) {
  return function (req, res, next) {
    let param = JSON.parse(req.body.p);
    callback(param, res);
  };
}



