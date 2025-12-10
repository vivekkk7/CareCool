// npm install nodemailer

const nodemailer = require('nodemailer');

async function aptMail(data, msg, retryCount = 2, delayBetweenRetries = 2000) {
  async function send() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'carecool.info@gmail.com',
        pass: 'ydujmdpfymexuwly'
      }
    });

    const mailOptions = {
      from: 'carecool.info@gmail.com',
      to: data[3],
      subject: 'Appointment form submitted',
      html: `<h3>Appointment form submitted successfully.</h3>
            <p>We received your appointment form for your <b>${data[6]}</b>. We will contact you sortly to fulfill your request.</p>
            <p>Your appointment details are : </p>
            <p>Name : ${data[4]} <br>
               Mobile : ${data[5]} <br>
               Service : ${data[6]} <br>
               Address : ${data[8]}, ${data[7]}</p>
               <p>You can track your service request from your profile page or enter track id - <br />
               Trackid : ${data[1]}</p>    
               <p>${msg}</p>    
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
          await aptMail(data, msg, retryCount - 1, delayBetweenRetries = 2000);
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
    aptMail : aptMail,
};
