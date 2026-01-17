// npm install nodemailer

const nodemailer = require('nodemailer');

async function registerMail(data, service, retryCount = 2, delayBetweenRetries = 5000) {
  async function send() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.WEBSITE_EMAIL_FOR_SENDING_EMAIL_TO_ALL,
        pass: process.env.WEBSITE_EMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.WEBSITE_EMAIL_FOR_SENDING_EMAIL_TO_ALL,
      to: data[2],
      subject: 'Registration form submitted successfully',
      html: `<h3>Registration form  received.</h3>
            <p>Hey ${data[3]}, <br /><br />We received your registration form for joining in CareCool as a mechanic.<br /> After verification, we will inform you.</p>
            <p>Your registration details are : </p>
            <p>Name : ${data[3]} <br>
               Mobile : ${data[4]} <br>
               Address : ${data[8]}, ${data[7]}, ${data[6]}, ${data[5]}, ${data[9]}<br>
               Specification : ${service}</p>
                   
    <h4>Team CareCool</h4>`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      
    } catch (error) {
      console.log(error);

      if (retryCount > 0) {
        console.log(`Retrying in ${delayBetweenRetries / 1000} seconds...`);
        setTimeout(async () => {
          await registerMail(data, service, retryCount - 1, delayBetweenRetries = 5000);
        }, delayBetweenRetries);
      } else {
        console.log('Maximum retry count reached. Email not sent.');
        return false;
      }
    }
  }

  await send();
}

module.exports = {
    registerMail : registerMail,
};
