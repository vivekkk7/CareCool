const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const multer = require('multer');  //for file and form handling
const router = express.Router();


// Parse URL-encoded bodies (as used in the HTML form)
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());


var con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    port: process.env.SPORT,
    password: process.env.SPASS,
    database: process.env.SDNAME
});

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
    

        con.connect(function (err) {
            
                    if (userid2) {

                        let sq12 = 'SELECT userid FROM signup WHERE userid = ? UNION SELECT userid FROM user_profile WHERE userid = ?;';

                        con.query(sq12, [userid2, userid2], function (err, result, fields) {
                            if (err) throw err;

                            if (result.length == 0) {
                                res.cookie('userid', '', { expires: new Date(0), path: '/' });
                                res.render('about', ripeuser);
                                console.log("cookie deleted");
                            }
                            else {
                                res.render('about', rawuser);

                            }
                        });

                    }
                    else {
                        res.render('about', ripeuser);
                    }
                });

    } catch (error) {
        console.error('Error:', error);
        // res.status(500).send('Internal Server Error. Please try again.');
    }
});


module.exports = router;