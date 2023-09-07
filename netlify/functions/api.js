const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http')

const bodyParser = require('body-parser');
const api = express();

api.use(cors({
  origin: 'https://phenomenal-conkies-08b2af.netlify.app'
}));
api.use(bodyParser.json());

const port = 4000;

const router = express.Router();

router.get('/hello', (req, res) => {
  console.log('Someone wanted us to say hello')
  res.send('Hello World!')
});

const webpush = require('web-push') //requiring the web-push module
const vapidKeys = {
  publicKey:
    'BHsJUwGqWFaA_Ubn62si146OwXNtzmMs8-RrsbODbih168vmFh1-rOAbxQGYWhZnQp1_ASgBrA9OW9U_VVqiJxY',
  privateKey: 'MTLxXebNHcDCLwfMLRcjjBysjo3pyF-fvrFEi7zoc_E',
}

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  'mailto:myuserid@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const dummyDb = { subscription: null }; //dummy in memory store
const saveToDatabase = async (subscription) => {
  // Since this is a demo api, I am going to save this in a dummy in memory store. Do not do this in your apis.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription;
};

//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend='') => {
  webpush.sendNotification(subscription, dataToSend)
}

//route to test send notification
router.get('/send-notification', (req, res) => {
  const subscription = dummyDb.subscription //get subscription from your databse here.
  const message = 'Hello World'
  sendNotification(subscription, message)
  console.log('pushing notif....')
  res.json({ message: `pushing notif....`, subscription })
})

// The new /save-subscription endpoint
router.post('/save-subscription', async (req, res) => {
  const subscription = req.body;

  if (!subscription || Object.keys(subscription).length === 0) {
    console.log('No subcription found in request body')

    res.sendStatus(500);

    return;
  }

  await saveToDatabase(subscription); //Method to save the subscription to Database
  console.log('Saved to database')
  res.json({ message: 'success' });
});

// The new /save-subscription endpoint
router.post('/reset-subscription', async (req, res) => {
  dummyDb.subscription = null; //dummy in memory store
  console.log('RESET SUB')
  res.json({ message: 'RESET SUBCCES' });
});

api.use('/api/', router);

// Create an HTTP service.
// api.listen(port, () => console.log(`Running on ${port}`))

// module.exports = api;
module.exports.handler = serverless(api);
