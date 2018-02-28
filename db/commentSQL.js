let CommentSQL = {
  insertCommentReply: 'INSERT INTO `comment`(detail_id,owner_user_id,target_user_id,parent_id,root_id,content) VALUES(?,?,?,?,?,?)',  //回复

  insertComment: 'INSERT INTO `comment`(detail_id,owner_user_id,target_user_id,content) VALUES(?,?,?,?)',  //评论

  selectComment: 'SELECT a.*,unix_timestamp(a.date) as date,b.`name`,b.header_url FROM `comment` as a INNER JOIN `user` as b ON a.owner_user_id=b.id WHERE detail_id=? AND a.parent_id IS NULL ORDER BY date ASC',

  selectReply: 'SELECT a.*,b.name AS owner_user_name,b.header_url AS owner_user_header_url,c.`name` as target_user_name,c.header_url AS target_user_header_url FROM `comment` as a INNER JOIN `user` as b on a.owner_user_id=b.id INNER JOIN `user` AS c ON a.target_user_id=c.id WHERE root_id=? ORDER BY date ASC',

  insertMessageComment: 'INSERT INTO message_comment(comment_id) VALUES(?)',

  insertMyMessage: 'INSERT INTO my_message(user_id,target_table_id,target_table_name) VALUES(?,?,?)',

  selectCommentOne: 'SELECT a.*,b.name AS owner_user_name,b.header_url AS owner_user_header_url,c.`name` AS target_user_name,c.header_url AS target_user_header_url FROM `comment` AS a INNER JOIN `user` AS b ON a.owner_user_id=b.id INNER JOIN `user` AS c ON a.target_user_id=c.id WHERE a.id=?'

};

module.exports = CommentSQL;
