const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const moment = require('moment');
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

            con.query('SELECT * FROM review', (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                }
                 else {
                    ripeuser['reviews'] = results;
                    rawuser['reviews'] = results;
                    if (userid2) {

                        let sq12 = 'SELECT userid FROM signup WHERE userid = ? UNION SELECT userid FROM user_profile WHERE userid = ?;';

                        con.query(sq12, [userid2, userid2], function (err, result, fields) {
                            if (err) throw err;

                            if (result.length == 0) {
                                res.cookie('userid', '', { expires: new Date(0), path: '/' });
                                res.render('review', ripeuser);
                                console.log("cookie deleted");
                            }
                            else {
                                res.render('review', rawuser);

                            }
                        });

                    }
                    else {
                        res.render('review', ripeuser);
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);
        // res.status(500).send('Internal Server Error. Please try again.');
    }
});

router.post('/', (req, res) => {
    // Extract data from the form
    const name=req.body.name;
    const rating=req.body.rating;
    const reviewText=req.body.review;
   
    con.query('INSERT INTO review (name, rating, reviewText, entry_date, entry_time) VALUES (?, ?, ?)', [name, rating, reviewText, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/review');
        }
    });
  });


module.exports = router;