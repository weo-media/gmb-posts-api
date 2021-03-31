require('dotenv').config();
const fs = require('fs');
const GMB = require('./GMB');
const tokens = fs.existsSync('./accessToken.json') ? JSON.parse(fs.readFileSync('./accessToken.json')) : null

// const accessToken = GMB.getAccessToken(process.env.GMB_REFRESH_TOKEN);
// async () => {
//   console.log(await accessToken)
// }
// console.log(tokens);
// GMB.authenticate().catch(e => console.error(e));
GMB.get().catch(e => console.error(e));
