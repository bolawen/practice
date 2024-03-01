import puppeteer from 'puppeteer';

async function screenShot({ selector } = {}) {
  let buffer = null;

  const browser = await puppeteer.launch({
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.goto('https://www.baidu.com');

  if (selector) {
    const element = await page.$(selector);
    buffer = await element.screenshot({ path: 'screenshot/lg.png' });
  } else {
    buffer = await page.screenshot({
      fullPage: true,
      path: 'screenshot/lg.png'
    });
  }

  await page.close();
  await browser.close();
  return buffer;
}

(async () => {
  const buffer = await screenShot({ selector: '#lg' });
  console.log('buffer', buffer);
})();
