import Koa from 'koa';
import KoaRouter from 'koa-router';
import { register } from "./metrics.js";

const app = new Koa();
const router = new KoaRouter({ prefix: '' });

router.get('/', async ctx => {
  ctx.body = 'Hello World';
});

router.get('/metrics', async ctx => {
  ctx.headers['content-type'] = register.contentType;
  ctx.body = await register.metrics();
});

app.use(router.routes());
app.listen(4000, () => {
  console.log('Server is running at http://localhost:4000');
});
