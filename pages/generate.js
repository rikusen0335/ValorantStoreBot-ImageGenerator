
import chromium from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'

const Image = () => {
  return <></>
}


export const getServerSideProps = async (context) => {
//   const { title } = context.params
  const title = "aaa"
  const { res } = context;

  if (!title) {
    res.statusCode = 400
    res.end('Bad Request')
    return { props: {} }
  }

  const exePath = process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    console.log(exePath)

  const options = {
    development: {
      args: [],
      defaultViewport: { width: 1200, height: 630 },
      executablePath: exePath,
      headless: true
    }, // TODO: いったんローカルでの開発は断念した...
    production: {
      args: chromium.args,
      defaultViewport: { width: 1200, height: 630 },
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    },
    test: {},
  }[process.env.NODE_ENV];

  console.log(options)

  const browser = await puppeteer.launch(options)

  const html = `<html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">

        <style>
          body {
            width: 1200px;
            height: 675px;
            max-width: 1200px;
            max-height: 630px;
            background-color: #f9fafb;

            --bg-color: hsl(256, 33, 10);
            --dot-color: hsl(256, 33, 70);

            --dot-size: 1px;
            --dot-space: 22px;

            /*background:
                  linear-gradient(90deg, var(--bg-color) (var(--dot-space) - var(--dot-size)), transparent 1%) center,
                  linear-gradient(var(--bg-color) (var(--dot-space) - var(--dot-size)), transparent 1%) center,
                  var(--dot-color);
                background-size: var(--dot-space) var(--dot-space);*/

            background: linear-gradient(90deg, #fff 21px, transparent 4%) center, linear-gradient(#fff 21px, transparent 4%) center, #a799cc;
            background-size: 22px 22px;
          }

          .container {
            width: 100%;
            height: 100%;
            position: relative;
          }

          .title {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            width: 80%;
            height: 100%;
            margin: auto;
            color: #273141;
            font-size: 60px;
            font-weight: bold;
            line-height: 1.5;
            font-family: 'Noto Sans JP', sans-serif;
          }

          .site-name {
            position: absolute;
            right: 0;
            bottom: 0;
            color: #111;
            font-family:
              system-ui,
              -apple-system,
              'Segoe UI',
              Roboto,
              Helvetica,
              Arial,
              sans-serif,
              'Apple Color Emoji',
              'Segoe UI Emoji';
            font-weight: bold;
            font-size: 50px;
            margin-top: auto;
            margin-bottom: 20px;
            margin-right: 40px;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <div class="title">${title}</div>
          <p class="site-name">${COOL_SITE_NAME}</p>
        </div>
      </body>
    </html>`

  const page = await browser.newPage()
  await page.setContent(html)
  const buffer = await page.screenshot()

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000')
  res.end(buffer, 'binary')

  return { props: {} }
}

export default Image
