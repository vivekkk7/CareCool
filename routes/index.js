const express = require('express');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const multer = require('multer');  //for file and form handling
const mymulter = multer();
const router = express.Router();
const aptmail = require('../controllers/aptmail');
const atpmailtomech = require('../controllers/atpmailtomech');
const moment = require('moment');


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
        let district = ``;
        ripeuser['district'] = ``;
        rawuser['district'] = ``;


        con.connect(function (err) {
            if (err) throw err;
            console.log("mysql connected.")
            let sq12 = 'SELECT DISTINCT district FROM mechanics ORDER BY district;';

            con.query(sq12, function (err, result, fields) {
                if (err) throw err;

                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        district += `
                    <option value="${result[i].district}">${result[i].district}</option>`
                    }
                    ripeuser['district'] = district;
                    rawuser['district'] = district;

                    if (userid2) {

                        let sq12 = 'SELECT userid FROM signup WHERE userid = ? UNION SELECT userid FROM user_profile WHERE userid = ?;';

                        con.query(sq12, [userid2, userid2], function (err, result, fields) {
                            if (err) throw err;

                            if (result.length == 0) {
                                res.cookie('userid', '', { expires: new Date(0), path: '/' });
                                res.render('index', ripeuser);
                                console.log("cookie deleted");
                            }
                            else {
                                res.render('index', rawuser);

                            }
                        });

                    }
                    else {
                        res.render('index', ripeuser);
                    }
                }

            });
        });

    } catch (error) {
        console.error('Error:', error);
        // res.status(500).send('Internal Server Error. Please try again.');
    }
});


//appoint

router.post('/', mymulter.none(), async (req, res) => {
    try {
        let userid = req.cookies.userid;
        let apt = req.body;
        const min = 100000;
        const max = 999999;
        const temp_code = Math.floor(Math.random() * (max - min + 1)) + min;
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '');

        await new Promise((resolve, reject) => {

            con.connect(function (err) {
                if (err) {
                    con.end();
                    res.json({ isappoint: false, aerror: 'Unable to connect database. Please try again.' });
                    reject(err);
                    return;
                }

                if (userid) {
                    let sq1 = 'select * from signup where userid = ? order by signup_date desc, signup_time desc;';
                    con.query(sq1, [userid], function (err, result, fields) {
                        if (err) {
                            con.end();
                            res.json({ isappoint: false, aerror: 'Unable to execute query. Please try again.' });
                            reject(err);
                            return;
                        }

                        if (result.length == 0) {
                            // res.cookie('userid', '', { expires: new Date(0), path: '/' });
                            res.json({ isappoint: false, cdelete: true, aerror: 'Internal server error. Please try again.' });
                            // console.log("cookie deleted");
                            reject(err);
                            return;
                        }
                        else {
                            let msg = "Thanks for choosing CareCool";
                            appointfun(userid, 'true', msg);
                        }
                    });
                }
                else {
                    let code3 = apt.aemail + apt.amob + temp_code;
                    let userid2 = crypto.createHash('sha256').update(code3).digest('hex');
                    let msg = "For login in future, you need a password that can be created by filling signup form with same email."
                    appointfun(userid2, 'false', msg);
                }

                function appointfun(userid, signed, msg) {

                    var trackid = timestamp.slice(3, 16);
                    var fdata = [userid, trackid, signed, apt.aemail, apt.aname, apt.amob, apt.aservice, apt.adistrict, apt.acity, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')];

                    let aservice = '';
                    let xt = apt.aservice;
                    switch (xt) {
                        case 'AC Service':
                            aservice = 'ac';
                            break;
                        case 'Laptop Repairing':
                            aservice = 'laptop';
                            break;
                        case 'Washing Machine Repairing':
                            aservice = 'washingmachine';
                            break;
                        case 'Mobile Repairing':
                            aservice = 'mobile';
                            break;
                        case 'Refrigerator Repairing':
                            aservice = 'refrigerator';
                            break;
                        case 'Cooler Repairing':
                            aservice = 'cooler';
                            break;
                        case 'PC Repairing':
                            aservice = 'laptop'
                            break;
                        case 'Other':
                            aservice = ''
                            break;
                        default:
                            aservice = ''
                            break;
                    }

                    let sq2 = `select * from mechanics where ${aservice} = ? and district = ?;`;
                    con.query(sq2, ['on', apt.adistrict], function (err, result, fields) {
                        if (err) {
                            con.end();
                            res.json({ isappoint: false, aerror: 'Unable to execute query. Please try again.' });
                            reject(err);
                            return;
                        }

                        if (result.length > 0) {
                            let mechemail = result[0].email;
                            let mechuserid = result[0].userid;

                            let sql3 = `insert into appoint (userid, trackid, signedup, email, name, mob, service, district, city, appoint_date, appoint_time) values (?);`;
                            con.query(sql3, [fdata], function (err, result) {
                                if (err) {
                                    con.end();
                                    res.json({ isappoint: false, aerror: 'Unable to execute query. Please try again.' });
                                    reject(err);
                                    return;
                                }

                                aptmail.aptMail(fdata, msg);

                                atpmailtomech.aptMailToMech(fdata, mechemail)
                                    .then(() => {
                                        try {
                                            let sql8 = `select * from user_profile where userid = ?`;

                                            con.query(sql8, [userid], function (err, result) {
                                                if (err) {
                                                    con.end();
                                                    console.log("Data is not inserted into user_profile");
                                                    reject(err);
                                                    return;
                                                }

                                                if (result.length == 0) {
                                                    let fdata1 = [userid, apt.aemail, apt.aname, apt.amob, apt.adistrict, apt.acity];
                                                    let sql5 = `insert into user_profile (userid, email, name, mob, district, city) values (?);`;

                                                    con.query(sql5, [fdata1], function (err, result) {
                                                        if (err) {
                                                            con.end();
                                                            console.log("Data is not inserted into user_profile");
                                                            reject(err);
                                                            return;
                                                        }
                                                        console.log("Data is inserted into user_profile");
                                                    });
                                                }
                                                else {
                                                    console.log("Data is existed in user_profile");
                                                }

                                            });

                                            let fdata2 = [trackid, mechuserid];
                                            let sql6 = `insert into track (trackid, muserid) values (?);`;

                                            con.query(sql6, [fdata2], function (err, result) {
                                                if (err) {
                                                    con.end();
                                                    console.log("Data is not inserted into track");
                                                    reject(err);
                                                    return;
                                                }
                                                console.log("Data is inserted into track");
                                            });

                                        } catch (error) {
                                            console.error('Error in appoint:', error);
                                        }

                                        res.json({ isappoint: true, issigned: signed, cookie: userid });
                                        resolve();
                                        return;
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        // res.status(500).json({ issign: false, serror: 'Error in sending email. Please try again.' });
                                    });

                            });
                        }
                        else {
                            res.json({ isappoint: false, aerror: `Sorry, ${apt.aservice} service is not available in ${apt.adistrict}.` });
                            reject(err);
                            return;
                        }

                    });
                }
            });
        });
    } catch (error) {
        console.error('Error in appoint:', error);
        // res.json({ isappoint: false, aerror: 'Internal server error. Please try again.' });
    }
});


module.exports = router;