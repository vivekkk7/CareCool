const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const moment = require('moment');

const router = express.Router();
const mofficeapproved = require('../controllers/mechapprovedoffice');


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


router.get('/mech-approved', async (req, res) => {
    try {
        const mapproveid = req.query.mapproveid;
        
        await new Promise((resolve, reject) => {
            con.connect(function (err) {
                if (err) {
                    con.end();
                    res.send(err);
                    reject(err);
                    return;
                }

                let sql = `select * from  mregistration where approvedid = ?;`;
                con.query(sql, [mapproveid], (err, result) => {
                    if (err) {
                        con.end();
                        res.send(err);
                        reject(err);
                        return;
                    }
                    if (result.length == 0) {
                        con.end();
                        reject(err);
                        res.send('No data in mechanic registration table');
                        return;
                    }
                    else{
                        let data = [result[0].userid, result[0].email, result[0].name, result[0].mob, result[0].state, result[0].district, result[0].city, result[0].street, result[0].pincode, result[0].ac, result[0].refrigerator, result[0].fan, result[0].tv, result[0].mobile, result[0].cooler, result[0].laptop, result[0].washingmachine, moment().format('DD-MM-YYYY'), moment().format('HH:mm:ss')];

                        let sql2 = `insert into mechanics (userid, email, name, mob, state, district, city, street, pincode, ac, refrigerator, fan, tv, mobile, cooler, laptop, washingmachine, entry_date, entry_time) values (?);`;
                        con.query(sql2, [data], (err, result) => {
                            if (err) {
                                reject(err);
                                return;
                            }                             
                            mofficeapproved.mechApproved(data[2], data[1]);
                            res.send('Done! Mechanic data inserted into mechanic table.');
                            resolve();
                            return;
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error in registration: ', error);
        res.send(error);
    }
});

module.exports = router;