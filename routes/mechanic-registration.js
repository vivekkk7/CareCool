const express = require('express');
const url = require('url');
const crypto = require('crypto');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const multer = require('multer');  //for file and form handling
const mymulter = multer();
const router = express.Router();
const registermail = require('../controllers/registermail');
const registermailtooffice = require('../controllers/registermail-to-office');
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



// registration page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/mech-registration.html'));
});


//
router.post('/', mymulter.none(), async (req, res) => {
    try {
        let data = req.body;
        
        await new Promise((resolve, reject) => {
            con.connect(function (err) {
                if (err) {
                    con.end();
                    res.json({ isappoint: false, aerror: 'Unable to connect database. Please try again.' });
                    reject(err);
                    return;
                }

                let sql2 = `select * from  mechanics where email = ?;`;
                con.query(sql2, [data.memail], (err, result) => {
                    if (err) {
                        con.end();
                        res.json({ issign: false, serror: 'Unable to execute database query. Please try again.' });
                        reject(err);
                        return;
                    }
                    if (result.length == 0) {
                        let service = [];
                
                        if (data.ac == 'on') { service.push("AC Service"); }
                        if (data.washingmachine == 'on') { service.push("Washing Machine Service"); }
                        if (data.laptop == 'on') { service.push("Laptop Service"); }
                        if (data.cooler == 'on') { service.push("Cooler Service"); }
                        if (data.mobile == 'on') { service.push("Mobile Service"); }
                        if (data.tv == 'on') { service.push("TV Service"); }
                        if (data.fan == 'on') { service.push("Fan Service"); }
                        if (data.refrigerator == 'on') { service.push("Refrigerator Service"); }
        
                        const min = 100000;
                        const max = 999999;
                        const temp_code = Math.floor(Math.random() * (max - min + 1)) + min;
                        let code3 = data.memail + temp_code + data.mmob + data.mname;
                        let userid = crypto.createHash('sha256').update(code3).digest('hex');
                        let approvedid = temp_code + userid;
                        let fdata = [approvedid, userid, data.memail, data.mname, data.mmob, data.mstate, data.mdistrict, data.mcity, data.mstreet, data.mpincode, data.ac, data.refrigerator, data.fan, data.tv, data.mobile, data.cooler, data.laptop, data.washingmachine, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')];
        
                        let sql3 = `insert into mregistration (approvedid, userid, email, name, mob, state, district, city, street, pincode, ac, refrigerator, fan, tv, mobile, cooler, laptop, washingmachine, register_date, register_time) values (?);`;
                        con.query(sql3, [fdata], function (err, result) {
                            if (err) {
                                con.end();
                                res.json({ isappoint: false, aerror: 'Unable to execute query. Please try again.' });
                                reject(err);
                                return;
                            }
        
                            registermail.registerMail(fdata, service);
                            registermailtooffice.registerMailToOffice(fdata, service)
                            .then(() => {
                                res.json({ isappoint: true });
                            })
                            .catch((error) => {
                                console.error(error);
                                res.json({ isappoint: true });
                            });
        
                            resolve();
                            return;
                        });
                    }
                    else{
                        res.json({ isappoint: false, aerror: 'Email already exit. Please enter another one.' });
                        resolve();
                        return;
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error in registration: ', error);
        res.json({ isappoint: false, aerror: 'Internal server error. Please try again.' });
    }
});


module.exports = router;