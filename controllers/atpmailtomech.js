// npm install nodemailer

const nodemailer = require('nodemailer');

async function aptMailToMech(data, mechemail, retryCount = 2, delayBetweenRetries = 2000) {
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
      to: mechemail,
      subject: 'Someone requested a service',
      html: `<h3>Accept someone service request.</h3>
            <p>Request details are : </p>
            <p>Name : ${data[4]} <br>
               Mobile : ${data[5]} <br>
               Email : ${data[3]} <br>
               Trackid : ${data[1]} <br>
               Service : ${data[6]} <br>
               Address : ${data[8]}, ${data[7]}</p>
               <p>Go to profile : <a href='http://localhost:8080/mechanic-dashboard/request'>http://localhost:8080/mechanic-dashboard/request</a><p>
            <h4>From CareCool</h4>`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      
    } catch (error) {
      console.log(error);

      if (retryCount > 0) {
        console.log(`Retrying in ${delayBetweenRetries / 1000} seconds...`);
        setTimeout(async () => {
          await aptMailToMech(data, mechemail, retryCount - 1, delayBetweenRetries = 2000);
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
    aptMailToMech : aptMailToMech,
};
