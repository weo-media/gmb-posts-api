require('isomorphic-fetch');
const fs = require('fs');
const { URLSearchParams } = require('url');
const GMB = 'https://mybusiness.googleapis.com';
const { google } = require('googleapis');
const credentials = require('./credentials.json');
const readline = require('readline');
const access = require('./accessToken.json');

// setting up service account access
exports.authenticate = async () => {
  const authenticateUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/business.manage'],
    prompt: 'consent'
  });
  return await authenticateUrl
}

const auth1 = () => {
  const authy = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0],
    access.access_token,
    access.refresh_token
  );

  return authy;
}

const auth2 = () => {
  return new google.auth.GoogleAuth({
    keyFile: './WEO GMB Posting test cce0b6d5b1c8.json',
    scopes: ['https://www.googleapis.com/auth/business.manage'],
  });
}

const auth = auth1();

google.options({
  auth: auth
})

if (typeof auth.on === 'function') {
  auth.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      const data = access;
      data.refresh_token = tokens.refresh_token;
      fs.writeFileSync('./accessToken.json', JSON.stringify(data))

      console.log('new refresh token:', tokens.refresh_token);
    }
    console.log('access token:', tokens.access_token);
  });
}

exports.get = async () => {
  // get authenticateUrl

  if (auth._clientId === auth1()._clientId) {
    console.log('\nretrieve the authentication code:\n\n', await this.authenticate(), '\n\n');

    const code = await askQuestion("Provide the authentication code:\n");

    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);
  }

  let endpoint = true;
  let requestType = '';
  let getResponse = '';

  do {
    requestType = await askQuestion("Enter request type. type 'GET'(default), 'POST', etc.\n");
    endpoint = await askQuestion("Enter endpoint. type 'stop' to quit.\n");
    if (endpoint && endpoint !== '' && endpoint !== 'stop') {
      console.log(`hitting the endpoint /v4/${endpoint}`);
      getResponse = await fetch(`${GMB}/v4/${endpoint}`,
        {
          method: `${requestType === '' ? 'GET' : requestType}`,
          headers: await auth.getRequestHeaders()
        })
        .then(r => {
          if (r.status >= 400) {
            throw new Error("Bad response from server: " + r.statusText)
          }
          return r.json();
        })
        .then(json => {
          return json;
        })
        .catch(e => { if (e) console.error(e) });
      console.log(getResponse);
    }
  } while (endpoint && endpoint !== '' && endpoint !== 'stop');
  return getResponse;
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}