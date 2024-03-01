import Koa from 'koa';
import Redis from 'ioredis';
import Router from 'koa-router';

const app = new Koa();
const router = new Router({ prefix: '/' });
const redis = new Redis({
  port: 6379,
  host: '127.0.0.1'
});

router.get('test', async ctx => {
  const query = ctx.request.query;
  const redisKey = query.key;
  let redisResult = await redis.get(redisKey);
  if (redisResult) {
    ctx.body = redisResult;
  } else {
    ctx.body = 'no redis result';
    await redis.set(redisKey, '有的人活着, 他已经死了, 有的人死了, 它还活着');
  }
});

app.use(router.routes());
app.listen(3000, () => {
  console.log('server is running at http://localhost:3000');
});
