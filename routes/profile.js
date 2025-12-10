const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
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



// profile
router.get('/', (req, res) => {
    try {
        let userid3 = req.cookies.userid;
        let field;
        if (req.cookies.field) {
            field = req.cookies.field;
        }
        else {
           field = '';
        }

        if (userid3) {
            con.connect(function (err) {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    return res.end("404 not found");
                }
                if (field == ``) {
                    let sq13 = 'select * from user_profile where userid = ?;';
                    con.query(sq13, [userid3], function (err, result, fields) {
                        if (err) {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            return res.end("404 not found");
                        }

                        if (result.length > 0) {
                            let pdata = {
                                pname: result[0].name,
                                pemail: result[0].email,
                                pmob: result[0].mob,
                                paddress: result[0].city + ", " + result[0].district,
                            }

                            let sq11 = "SELECT appoint.*, track.* FROM appoint JOIN track ON appoint.trackid = track.trackid WHERE appoint.userid = ? order by appoint_date desc, appoint_time desc;";
                            con.query(sq11, [userid3], function (err, result, fields) {
                                if (err) {
                                    res.writeHead(404, { 'Content-Type': 'text/html' });
                                    return res.end("404 not found");
                                }

                                if (result.length == 0) {
                                    res.render('profile', { pdata: pdata, trackdata: '<p>none</p>', display: "style='display:none;'" });
                                }
                                else {
                                    let tr = ``;
                                    let visiting_date;
                                    let delivery_date;
                                    for (let i = 0; i < result.length; i++) {
                                        let date = new Date(result[i].appoint_date);
                                        let options = { day: 'numeric', month: 'numeric', year: 'numeric' };
                                        let appoint_date = date.toLocaleDateString('en-GB', options);

                                        if (result[i].visiting_date == null) {
                                            visiting_date = '---';
                                        }
                                        else {
                                            let date = new Date(result[i].visiting_date);
                                            let options = { day: 'numeric', month: 'numeric', year: 'numeric' };
                                            visiting_date = date.toLocaleDateString('en-GB', options);
                                        }
                                        if (result[i].delivery_date == null) {
                                            delivery_date = '---';
                                        }
                                        else {
                                            let date = new Date(result[i].delivery_date);
                                            let options = { day: 'numeric', month: 'numeric', year: 'numeric' };
                                            delivery_date = date.toLocaleDateString('en-GB', options);
                                        }

                                        tr += `<tr>
                                    <td data-label="S.N.">${i + 1}</td>
                                    <td data-label="S.N.">${appoint_date}</td>
                                    <td data-label="Trackid">${result[i].trackid}</td>
                                    <td data-label="Service">${result[i].service}</td>
                                    <td data-label="Visiting on">${visiting_date}</td>
                                    <td data-label="Mechanic visit">${result[i].visited_date}</td>
                                    <td data-label="Shop address">${result[i].shop_address1}</td>
                                    <td data-label="Delivery date">${delivery_date}</td>
                                    <td data-label="Status">${result[i].finish}</td>
                                  </tr>`;
                                    }

                                    res.render('profile', { pdata: pdata, trackdata: tr, display: "style='display:block;'" });
                                }
                            });
                        }
                        else {
                            let sq13 = 'select * from signup where userid = ?;';
                            con.query(sq13, [userid3], function (err, result, fields) {
                                if (err) {
                                    res.writeHead(404, { 'Content-Type': 'text/html' });
                                    return res.end("404 not found");
                                }
        
                                if (result.length > 0) {
                                    let pdata = {
                                        pname: '',
                                        pemail: result[0].email,
                                        pmob: '',
                                        paddress: '',
                                    }  
                                    res.render('profile', { pdata: pdata, trackdata: '<p>none</p>', display: "style='display:none;'" });
                      
                                }
                                else {
                                    res.redirect('/auth');
                                }
                            });
                        }
                    });
                }
                else {
                    res.redirect('/mechanic-dashboard');
                }
            });
        }
        else {
            res.redirect('/auth');
        }
    }
    catch (error) {
        // res.writeHead(404, { 'Content-Type': 'text/html' });
        // return res.end("404 not found");
        console.log(error);
    }
});

module.exports = router;