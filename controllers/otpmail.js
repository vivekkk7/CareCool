// npm install nodemailer

const nodemailer = require('nodemailer');

async function sendMail(user_email, ucode, link, retryCount = 2, delayBetweenRetries = 2000) {
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
      to: user_email,
      subject: 'Verify your email in CareCool',
      html: `<p>Your email verification code is <b>${ucode}</b>.<br /><p style='text-align:center;'> <b>OR</b> </p>
      <p>Click below link to verify your email</p>
      <p><a src='${link}'>${link}</a></p>
      <p> Please do not share this verification code with anyone to avoid any unauthorized access.</p>
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
          await sendMail(user_email, ucode, link, retryCount - 1, delayBetweenRetries);
        }, delayBetweenRetries);
      } else {
        console.log('Maximum retry count reached. Email not sent.');
        return false;
      }
    }
  }

  await send();
}

// sendMail('ivlog.site@gmail.com', 445454);
module.exports = {
  sendMail: sendMail,
};
