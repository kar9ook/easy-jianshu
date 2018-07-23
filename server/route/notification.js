const Router = require('koa-router');
const ObjectId = require('mongoose').Types.ObjectId;
const Comment = require('../model/Comment');
const { returnJSON } = require('../utils/retBody');
const router = new Router();
const User = require('../model/User');
const Article = require('../model/Article');
const Notification = require('../model/Notification');

const getReplyList = (replyList) => {
  let replyPromiseList = replyList.map(id => {
    return new Promise((resolve, reject) => {
      Comment.findOne({_id: id})
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        })
    })
  });
  return Promise.all(replyPromiseList);
}

router.get('/list', async (ctx, next) => {
  ctx.set('Content-Type', 'application/json');
  const type = ctx.request.query.type;
  const uid = ctx.cookies.get('uid');
  if (!type || !uid) {
    ctx.body = returnJSON('failed', {});
    await next();
  }
  const ucNotifications = (await User.findById(uid)).unCheckedNotifications;
  if (ucNotifications.length) {
      let promiseList = ucNotifications.map(async (item, index) => {
        const notification = await Notification.findById(item);
        const article = await Article.findById(notification.contentId);
        return await {
          pseudonym: article.pseudonym,
          title: article.title,
          meta: article.meta,
          _id: article._id
        }
      })
      let notificationList = await Promise.all(promiseList);
      ctx.body = returnJSON('success', {
        list: notificationList
      });
  } else {
    ctx.body = returnJSON('failed', {});
  }

})
// 
module.exports = router;