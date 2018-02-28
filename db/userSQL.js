/**
 * Created by apple on 2017/9/23.
 */

let UserSQL = {
    selectUserAll:'select * from user',

    selectUserOne:'select * from user where name = ?',

    insertUserOne:'insert into user(name,pwd) values(?,?)',

    selectMyMessage: 'SELECT * FROM my_message WHERE user_id=? ORDER BY date ASC',

    selectMessageComment: 'SELECT b.*,b.id as comment_id FROM message_comment as a INNER JOIN `comment` as b ON a.comment_id=b.id  WHERE a.id=?',

    selectUserTokenOne: 'SELECT *  FROM user_manage WHERE token=?',

    insertUserTokenOne: 'INSERT INTO user_manage(token,is_valid,user_id) VALUES(?,?,?)',

    updateUserTokenOne: 'UPDATE user_manage set is_valid=? WHERE id=?'

};


module.exports = UserSQL;
