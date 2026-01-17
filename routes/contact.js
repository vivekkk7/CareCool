const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const router = express.Router();
const contactmail = require('../controllers/contactmail');
const moment = require('moment');



// Parse URL-encoded bodies (as used in the HTML form)
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());


const ripeuser = {
   mechreg: ` <div class="signup_btn" id="mech_sign" >
   <p>Mechanic</p>
   <p>Register</p>
   </div>`,
    sign: ` <div class="signup_btn" id="cust_sign" >
            <p>SignUp</p>
            <p>& Login</p>
            </div>`,
    userbtn: ` <div class="srhbtn userbtn" onclick="profile()" style="display:none;">
            <i class="fa-solid fa-user"></i>
            </div>`
}

const rawuser = {
    mechreg: ` <div class="signup_btn" id="mech_sign"  style="display:none;">
    <p>Mechanic</p>
    <p>Register</p>
    </div>`,
    sign: ` <div class="signup_btn" id="cust_sign" style="display:none;">
            <p>SignUp</p>
            <p>& Login</p>
            </div>`,
    userbtn: ` <div class="srhbtn userbtn" onclick="profile()">
            <i class="fa-solid fa-user"></i>
            </div>`
}

// home page
router.get('/', (req, res) => {
    try {
        let userid2 = req.cookies.userid;
     
                    if (userid2) {

                        let sq12 = 'SELECT userid FROM signup WHERE userid = ? UNION SELECT userid FROM user_profile WHERE userid = ?;';

                        req.con.query(sq12, [userid2, userid2], function (err, result, fields) {
                            if (err) throw err;

                            if (result.length == 0) {
                                res.cookie('userid', '', { expires: new Date(0), path: '/' });
                                res.render('contact', ripeuser);
                                console.log("cookie deleted");
                            }
                            else {
                                res.render('contact', rawuser);

                            }
                        });

                    }
                    else {
                        res.render('contact', ripeuser);
                    }
                

    } catch (error) {
        console.error('Error:', error);
        // res.status(500).send('Internal Server Error. Please try again.');
    }
});
router.post("/greencheck", (req, res) => {
    const name= req.body.cname;
    const number= req.body.cmob;
    const email= req.body.cemail;
  
    const message= req.body.cmsg;
  
    // Store data in the database
    const sql =
      "INSERT INTO contact (name, mob, email, msg, entry_date, entry_time) VALUES (?, ?, ?, ?, ?, ?)";
    req.con.query(sql, [name, number, email, message, moment().format('YYYY-MM-DD'), moment().format('HH:mm:ss')], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        contactmail.contactMail(name, number, email, message);
  
        res.redirect('/');
      }
    });
  });

module.exports = router;