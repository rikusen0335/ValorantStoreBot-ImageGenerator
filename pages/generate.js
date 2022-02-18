
import chromium from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'
import getRawBody from 'raw-body';

const Image = () => {
  return <></>
}


export const getServerSideProps = async (context) => {
  // const { weaponSkins } = context.req;
  const { res } = context;

  // if (!title) {
  //   res.statusCode = 400
  //   res.end('Bad Request')
  //   return { props: {} }
  // }

  // Reference: https://github.com/vercel/next.js/discussions/14979
  const body = await getRawBody(context.req)
  const { weaponSkins } = JSON.parse(body.toString("utf-8"))

  // console.log(context.req)

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

  const makeHtmlResult = () => {
    /**
     * [
     *   {
     *     imageUrl: string,
     *     name: string,
     *     cost: string.
     *   }
     * ]
     */
    return weaponSkins.map((skin) => `
    <div class="weapon_skin">
      <div class="cost">
        <img class="cost_icon" src="https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/largeicon.png" />
        <p class="cost_amount">${skin.cost}</p>
      </div>
      <div class="skin_image_wrapper">
        <img class="skin_image" src="${skin.imageUrl}" />
      </div>
      <p class="skin_name">${skin.name}</p>
    </div>
    `).join("")
  }

  const html = `<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      width: 1200px;
      height: 630px;
      max-width: 1200px;
      max-height: 630px;
      margin: 0;

      background-color: #273141;
      background-size: 22px 22px;
    }

    p {
      margin: 0;
    }

    .container {
      /* border: 1px solid gray; */
      width: 100%;
      height: 100%;
      /* position: relative; */
      background-color: #273141;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 0px 0px;
      grid-template-areas:
        ". ."
        ". .";
    }

    .weapon_skin {
      margin: 16px;
      position: relative;
    }

    .cost {
      position: absolute;
      display: flex;
      align-items: center;
      top: 0;
      left: 0;
      margin-top: 24px;
      margin-left: 32px;
      background: #273141;
      padding: 4px 10px;
      border: 1px solid #414B5B;
    }
    .cost_icon {
      width: 28px;
      height: 28px;
    }
    .cost_amount {
      margin-left: 6px;
      margin-bottom: 3px;
      letter-spacing: 1px;
      color: #f9fafb;
      font-size: 22px;
      line-height: 22px;
      font-family: 'Noto Sans JP', sans-serif;
    }

    .skin_image_wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 90%;
      object-fit: contain;
    }
    .skin_image {
      margin: auto;
      object-fit: contain;
    }
    .skin_name {
      position: absolute;
      text-align: center;
      bottom: 0;
      right: 0;
      left: 0;
      margin-left: auto;
      margin-right: auto;
      margin-top: auto;
      font-weight: bold;
      line-height: 1.5;
      color: #f9fafb;
      font-size: 32px;
      font-family: 'Noto Sans JP', sans-serif;
      margin-bottom: 32px;
    }
  </style>
</head>

<body>
  <div class="container">
    ${makeHtmlResult()}
  </div>
</body>
    </html>`

  const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const page = await browser.newPage()
  await page.setContent(html)

  // await wait(1000 * 2); // This is unnecessary now

  const buffer = await page.screenshot()

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000')
  res.end(buffer, 'binary')

  return { props: {} }
}

export default Image
