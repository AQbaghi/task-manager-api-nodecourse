const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET
});

//sms for creating account
const sendWelcomingSMS= (number, name)=>{
    const from = 'Vonage APIs';
    const to = number;
    const text = `hello ${name}, welcome to the task manager app.`;

    nexmo.message.sendSms(from, to, text);
}

//sms for deleting account
const sendFarewaleSMS= (number, name)=>{
  const from = 'Vonage APIs';
  const to = number;
  const text = `hello ${name}, we wish we could have made you stay, sorry you think the app sucks ass bro.`;

  nexmo.message.sendSms(from, to, text);
}


module.exports= { sendWelcomingSMS, sendFarewaleSMS };