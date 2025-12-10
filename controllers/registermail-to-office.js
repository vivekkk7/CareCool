// npm install nodemailer

const nodemailer = require('nodemailer');

async function registerMailToOffice(data, service, retryCount = 2, delayBetweenRetries = 5000) {
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
      to: 'ivlog.site@gmail.com',       //office email
      subject: 'Someone apply for mechanic registration',
      html: `<h3>Someone apply for mechanic registration.</h3>
            <p>Registration details are as : </p>
            <p>Name : ${data[3]} <br>
               Email: : ${data[2]} <br>
               Mobile : ${data[4]} <br>
               Address : ${data[8]}, ${data[7]}, ${data[6]}, ${data[5]}, ${data[9]}<br>
               Specification : ${service}</p>
               <br /><br />
               <p style='text-align:center;'><a href='http://localhost:8080/office/mech-approved?mapproveid=${data[0]}' style='padding:10px 20px; background-color: green; color: white; font-size: 18px; font-weight: 700;'>Approved ${data[3]}</a></p>
               <br /> 
               <p>OR click link : </p>
               <p><a href='http://localhost:8080/office/mech-approved?mapproveid=${data[0]}'>http://localhost:8080/office/mech-approved?mapproveid=${data[0]}</a></p>
               
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
          await registerMailToOffice(data, service, retryCount - 1, delayBetweenRetries = 5000);
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
    registerMailToOffice : registerMailToOffice,
};
