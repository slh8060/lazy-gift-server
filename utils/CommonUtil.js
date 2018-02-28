//获取时间
function getTime(differ,publishDate) {
  let time = "";
  if (differ <= 5 * 60 ) {    //5分钟以内
    time = "刚刚";
  } else if (differ > 5 * 60  && differ <= 60 * 60 ) {   //60分钟以内
    time = parseInt(differ  / 60 ) + "分钟前";
  } else if (differ > 60 * 60  && differ <= 24 * 60 * 60 ) {  //1天内
    time = parseInt(differ/60/60) + "小时前";
  } else if (differ > 24 * 60 * 60  && differ <= 2 * 24 * 60 * 60 ) {  //昨天
    time = "昨天 " + timeFormat(publishDate).hour + ":" + timeFormat(publishDate).mimute;
  } else if (differ > 2 * 24 * 60 * 60  && differ <= 3 * 24 * 60 * 60 ) {  //前天
    time = "前天 " + timeFormat(publishDate).hour + ":" + timeFormat(publishDate).mimute;
  } else if (differ > 3 * 24 * 60 * 60  && differ < 365 * 24 * 60 * 60  ){   //今年
    time = timeFormat(publishDate).month + "-" + timeFormat(publishDate).day + " "
      + timeFormat(publishDate).hour + ":" + timeFormat(publishDate).mimute;
  } else if (differ ){  //往年
    time = timeFormat(publishDate).year + " " + timeFormat(publishDate).month + "-" + timeFormat(publishDate).day + " "
      + timeFormat(publishDate).hour + ":" + timeFormat(publishDate).mimute;
  }
  return time;
}

//时间格式化
function timeFormat(timeStamp) {
  //return new Date(parseInt(timeStamp) * 1000).toLocaleString();
  let time = new Date(timeStamp);
  let year = time.getFullYear();
  let month = add0(time.getMonth() + 1);
  let day = add0(time.getDate());
  let hour = add0(time.getHours());
  let mimute = add0(time.getMinutes());
  let second = add0(time.getSeconds());
  return {
    year, month, day, hour, mimute, second
  }
}

//单数字日期处理
function add0(m) {
  return m < 10 ? '0' + m : m
}

//异步处理
class AsyncCallback {
  constructor(count, callback) {
    this.count = count;
    this.realCallback = callback;
    if (count == 0) {
      callback();
    }
  }
  exect() {
    this.count--;
    if (this.count == 0) {
      this.realCallback();
    }
  }
}

//生成token
function randomWord(randomFlag, min, max){
  var str = "",
    range = min,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // 随机产生
  if(randomFlag){
    range = Math.round(Math.random() * (max-min)) + min;
  }
  for(var i=0; i<range; i++){
    pos = Math.round(Math.random() * (arr.length-1));
    str += arr[pos];
  }
  return str;
}

randomWord(false, 43);


module.exports = {
  getTime: getTime,   //获取时间
  AsyncCallback: AsyncCallback,  //异步处理
  randomWord: randomWord   //生成随机数
};
