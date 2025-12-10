// npm install nodemailer

const nodemailer = require('nodemailer');

async function contactMail(name, number, email, message, retryCount = 2, delayBetweenRetries = 2000) {
  async function send() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'carecool.info@gmail.com',
        pass: 'ydujmdpfymexuwly'
      }
    });

    const mailOptions = {
        from: "hasanabbass638@gmail.com",
        to: "hasanabbass638@gmail.com",
        subject: "New Contact Form Submission",
        text: `Name: ${name}\nNumber: ${number}\nEmail: ${email}\nMessage: ${message}`,
      };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      
    } catch (error) {
      console.log(error);

      if (retryCount > 0) {
        console.log(`Retrying in ${delayBetweenRetries / 1000} seconds...`);
        setTimeout(async () => {
          await contactMail(name, number, email, message, retryCount - 1, delayBetweenRetries = 2000);
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
  contactMail: contactMail,
};
