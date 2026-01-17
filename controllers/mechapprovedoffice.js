// npm install nodemailer

const nodemailer = require('nodemailer');

async function mechApproved(name, email, retryCount = 2, delayBetweenRetries = 2000) {
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
      to: email,
      subject: 'Your request accepted as mechanic in CareCool',
      html: `<h3>Congratulation! ${name}, now you are a mechanic in CareCool.</h3>
            <p>We accept your request for joining in CareCool for mechanic post.</p>
            <p>Please go to signup page and signed up by create strong password for your account with same email id you provided to us.</p>
            <p>Your email : ${email} <br>
               Signup page link : <a href='http://localhost:8080/auth'>http://localhost:8080/auth</a></p>
                   
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
          await mechApproved(name, email, retryCount - 1, delayBetweenRetries = 5000);
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
    mechApproved : mechApproved,
};
