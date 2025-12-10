const express = require('express');
const crypto = require('crypto');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const multer = require('multer');  //for file and form handling
const mymulter = multer();
const router = express.Router();
const otpmail = require('../controllers/otpmail');
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


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/authform.html'));
});
router.get('/vcode', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/vcode.html'));
});

//login form when submit btn click

router.post('/login', mymulter.none(), async (req, res) => {
    try {
        let data22 = req.body;
        let email22 = data22.login_email;
        const password22 = crypto.createHash('sha256').update(data22.login_password).digest('hex');
        console.log(email22);
        console.log(password22);

        await new Promise((resolve, reject) => {
            con.connect(function (err) {
                if (err) {
                    con.end();
                    res.json({ islogin: false, lerror: 'Unable to connect database. Please try again.' });
                    reject(err);
                    return;
                }

                sql22 = `select * from signup where email = ? order by signup_date desc, signup_time desc;`;
                con.query(sql22, [email22], (err, result) => {
                    if (err) {
                        con.end();
                        res.json({ islogin: false, lerror: 'Unable to execute database query. Please try again.' });
                        reject(err);
                        return;
                    }

                    if (result.length == 0) {
                        res.json({ islogin: false, lmail: false, lerror: 'Email doesnot match.' });
                        resolve();
                        return;
                    }
                    else {
                        let userid = result[0].userid;

                        if (password22 == result[0].password) {

                            let sql2 = `select * from mechanics where userid = ? order by entry_date desc, entry_time desc;`;

                            con.query(sql2, [userid], (err, result2) => {
                                if (err) {
                                    con.end();
                                    res.json({ islogin: false, lerror: 'Unable to execute query. Please try again.' });
                                    reject(err);
                                    return;
                                }

                                if (result2.length > 0) {
                                    res.json({ islogin: true, lcookie: result[0].userid, field: 'mechanic', lerror: 'Email and password matched.' });
                                    resolve();
                                    return;
                                }
                                else if (result2.length == 0) {
                                    res.json({ islogin: true, lcookie: result[0].userid, lerror: 'Email and password matched.' });
                                    resolve();
                                    return;
                                }
                            });
                        }
                        else {
                            res.json({ islogin: false, lpass: false, lerror: 'Password doesnot match.' });
                            resolve();
                            return;
                        }
                    }
                });
            });
        });
    }
    catch (error) {
        console.error('Error in login:', error);
        res.json({ islogin: false, lerror: 'Internal server error. Please try again.' });
    }
});


//signup form when submit btn click

router.post('/signup', mymulter.none(), async (req, res) => {
    try {
        let data33 = req.body;
        const email33 = data33.signup_email;
        const password33 = crypto.createHash('sha256').update(data33.signup_password2).digest('hex');
        console.log(email33);
        console.log(password33);
        const min = 100000;
        const max = 999999;
        const temp_code = Math.floor(Math.random() * (max - min + 1)) + min;


        await new Promise((resolve, reject) => {
            con.connect(function (err) {
                if (err) {
                    res.json({ issign: false, serror: 'Unable to conncet database. Please try again.' });
                    con.end();
                    reject(err);
                    return;
                }

                let sql33 = `select email from signup where email = ? order by signup_date desc, signup_time desc;`;
                con.query(sql33, [email33], (err, result1) => {
                    if (err) {
                        con.end();
                        res.json({ issign: false, serror: 'Unable to execute database query. Please try again.' });
                        reject(err);
                        return;
                    }
                    if (result1.length === 0) {

                        let sql4 = `select * from appoint where email = ? order by appoint_date desc, appoint_time desc;`;

                        con.query(sql4, [email33], (err, result2) => {
                            if (err) {
                                con.end();
                                res.json({ issign: false, serror: 'Unable to execute database query. Please try again.' });
                                reject(err);
                                return;
                            }

                            if (result2.length === 0) {

                                let sql7 = `select * from mechanics where email = ? order by entry_date desc, entry_time desc;`;

                                con.query(sql7, [email33], (err, result3) => {
                                    if (err) {
                                        con.end();
                                        res.json({ issign: false, serror: 'Unable to execute database query. Please try again.' });
                                        reject(err);
                                        return;
                                    }

                                    if (result3.length === 0) {
                                        let sql8 = `select * from mregistration where email = ? order by register_date desc, register_time;`;
                                        con.query(sql8, [email33], (err, result4) => {
                                            if (err) {
                                                con.end();
                                                res.json({ issign: false, serror: 'Unable to execute database query. Please try again.' });
                                                reject(err);
                                                return;
                                            }

                                            if (result4.length == 0) {
                                                let code2 = email33 + password33 + temp_code;
                                                let userid1 = crypto.createHash('sha256').update(code2).digest('hex');
                                                let link = `http://localhost:8080/auth/vcode?userid=${userid1}&ucode=${temp_code}`;

                                                let data12 = [userid1, email33, temp_code, password33, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')];
                                                authEntry(data12, link);
                                            }
                                            else if (result4.length > 0){
                                                res.json({ issign: false, serror: 'This email is used for mechanic registration which is not approved yet. Please wait until you get approved.' });
                                                resolve();
                                                return;
                                            }

                                        });
                                    }
                                    else if (result3.length > 0) {
                                        let link = `http://localhost:8080/auth/vcode?userid=${result3[0].userid}&ucode=${temp_code}`;
                                        let data1 = [result3[0].userid, email33, temp_code, password33, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')];
                                        authEntry(data1, link);
                                    }
                                });
                            } else if (result2.length > 0) {
                                let link1 = `http://localhost:8080/auth/vcode?userid=${result2[0].userid}&ucode=${temp_code}`;
                                let data13 = [result2[0].userid, email33, temp_code, password33, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')];
                                authEntry(data13, link1);
                            }
                        });
                    } else if (result1.length > 0) {
                        console.log('a9');
                        res.json({ issign: false, semail: 'exits', serror: 'Email already exit. Please enter another one.' });
                        resolve();
                        return;
                    }

                    function authEntry(data, link) {
                        let sql = `insert into auth (userid, email, ucode, password, auth_date, auth_time) values (?);`;
                        con.query(sql, [data], function (err, result) {
                            console.log('a3');
                            if (err) {
                                con.end();
                                res.json({ issign: false, serror: 'Unable to execute database query. Please try again.' });
                                reject(err);
                                return;
                            }

                            otpmail.sendMail(data[1], data[2], link)
                                .then(() => {
                                    res.json({ issign: true, slink: `/auth/vcode?userid=${data[0]}` });
                                })
                                .catch((error) => {
                                    console.error(error);
                                    res.status(500).json({ issign: false, serror: 'Error in sending email. Please try again.' });
                                });
                            resolve();
                            return;
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error in signup:', error);
       // res.json({ issign: false, serror: 'Internal server error. Please try again.' });
    }
});


// verify code

router.post('/vcode', mymulter.none(), async (req, res) => {
    try {
        let vcode = req.body.vcode;
        let vuserid = req.body.vuserid;
        console.log(vuserid, " - ", vcode);

        await new Promise((resolve, reject) => {
            con.connect(function (err) {
                if (err) {
                    con.end();
                    res.json({ isvcode: false, verror: 'Unable to connect database. Please try again.' });
                    reject(err);
                    return;
                }
                let sql = `select * from signup where userid = ?;`;
                con.query(sql, [vuserid], (err, result4) => {
                    if (err) {
                        con.end();
                        res.json({ isvcode: false, verror: 'Unable to execute database query. Please try again.' });
                        reject(err);
                        return;
                    }

                    if (result4.length > 0) {
                        res.json({ isvcode: false, verror: 'You are already signed up. Go to home page and refresh the page.' });
                    }
                    else {
                        let vsql = `select * from auth where userid = ?;`;
                        con.query(vsql, [vuserid], (err, result) => {
                            if (err) {
                                con.end();
                                res.json({ isvcode: false, verror: 'Unable to execute database query. Please try again.' });
                                reject(err);
                                return;
                            }

                            if(result.length == 0){
                                res.json({ isvcode: false, verror: 'No request found. Please try again.' });
                            }
                            else{
                                if (vcode == result[0].ucode) {
                                    let vuserid = result[0].userid;
                                    var vemail = result[0].email;
                                    let vdata = [vuserid, vemail, result[0].password, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')];
    
                                    let vsql2 = `insert into signup(userid, email, password, signup_date, signup_time) values(?);`;
    
                                    con.query(vsql2, [vdata], (err, result1) => {
                                        if (err) {
                                            con.end();
                                            res.json({ isvcode: false, verror: 'Unable to execute database query. Please try again.' });
                                            reject(err);
                                            return;
                                        }
                                        
                                        let sql2 = `select * from mechanics where userid = ? order by entry_date desc, entry_time desc;`;
    
                                        con.query(sql2, [vuserid], (err, result2) => {
                                            if (err) {
                                                con.end();
                                                res.json({ isvcode: false, verror: 'Unable to execute database query. Please try again.' });
                                                reject(err);
                                                return;
                                            }
    
                                            if (result2.length > 0) {
                                                res.json({ isvcode: true, vcookie: vuserid, field: 'mechanic' });
                                                resolve();
                                                return;
                                            }
                                            else if (result2.length == 0) {

                                                res.json({ isvcode: true, vcookie: vuserid });
                                                resolve();
                                                return;  
                                            }
                                        });
                                    });
                                }
                                else {
                                    res.json({ isvcode: false, vmatch: false });
                                    resolve();
                                    return;
                                }
                            }
                        });
                    }

                });
            });
        })
    } catch (error) {
        console.error('Error in vcode:', error);
        res.json({ isvcode: false, verror: 'Internal server error. Please try again.' });
    }
});


module.exports = router;