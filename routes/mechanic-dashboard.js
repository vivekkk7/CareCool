const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const multer = require('multer');  //for file and form handling
// const { finished } = require('stream');
const mymulter = multer();
const router = express.Router();
const moment = require('moment');


// Parse URL-encoded bodies (as used in the HTML form)
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());





// profile
router.get('/', (req, res) => {
    let userid3 = req.cookies.userid;
    let field;
        if (req.cookies.field) {
            field = req.cookies.field;
        }
        else {
           field = '';
        }

    if (userid3) {
   

            if (field == 'mechanic') {
                let sq13 = 'select * from mechanics where userid = ?;';
                let service = [];
                req.con.query(sq13, [userid3], function (err, result, fields) {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("404 not found");
                    }

                    if (result.length > 0) {
                        if (result[0].ac == 'on') { service.push("AC Service"); }
                        if (result[0].washingmachine == 'on') { service.push("Washing Machine Service"); }
                        if (result[0].laptop == 'on') { service.push("Laptop Service"); }
                        if (result[0].cooler == 'on') { service.push("Cooler Service"); }
                        if (result[0].mobile == 'on') { service.push("Mobile Service"); }
                        if (result[0].tv == 'on') { service.push("TV Service"); }
                        if (result[0].fan == 'on') { service.push("Fan Service"); }
                        if (result[0].refrigerator == 'on') { service.push("Refrigerator Service"); }

                        let data = {
                            name: result[0].name,
                            email: result[0].email,
                            mob: result[0].mob,
                            address: result[0].street + ", " + result[0].city + ", " + result[0].district + ", " + result[0].pincode,
                            specification: service,
                        }
                        res.render('mech-dashboard', data);
                    }
                    else {
                        res.redirect('/auth');
                    }

                });
            }
            else {
                res.redirect('/auth');
            }
    }
    else {
        res.redirect('/auth');
    }
});


//request

router.get('/request', (req, res) => {
    try {
        let userid = req.cookies.userid;
        let field = req.cookies.field;
        if (userid) {


                if (field == 'mechanic') {
                    let sq1 = 'select * from mechanics where userid = ?;';
                    req.con.query(sq1, [userid], function (err, result, fields) {
                        if (err) {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            return res.end("404 not found");
                        }

                        if (result.length > 0) {
                            let sq12 = "SELECT appoint.*, track.* FROM appoint JOIN track ON appoint.trackid = track.trackid WHERE track.muserid = ? order by appoint_date desc, appoint_time desc;";
                            req.con.query(sq12, [userid], function (err, result, fields) {
                                if (err) {
                                    res.writeHead(404, { 'Content-Type': 'text/html' });
                                    return res.end("404 not found");
                                }

                                if (result.length == 0) {
                                    res.render('request', { trackdata: '<p>none</p>', display: "style='display:none;'", msgp: "<p style='font-size: 30px; opacity: 0.5; text-align: center;'>Nothing Yet Here</p>", myscript: "" });
                                }
                                else if (result.length > 0) {
                                    let tr = ``, sdata = ``, sd = ``, dd = ``;

                                    for (let i = 0; i < result.length; i++) {

                                        let pendingc = "", finishedc = "", rejectedc ="";
                                        let updatebtn, sdate, visitdate, address, ddate;
                                        let date = new Date(result[i].appoint_date);
                                        let options = { day: 'numeric', month: 'numeric', year: 'numeric' };
                                        appoint_date = date.toLocaleDateString('en-GB', options);
                                        
                                        if (result[i].visiting_date == null) {
                                            sdate = null;
                                        }
                                        else {
                                            let date = new Date(result[i].visiting_date);
                                            sdate = date.toISOString().slice(0, 10);
                                        }
                                        if (result[i].delivery_date == null) {
                                            ddate = null;
                                        }
                                        else {
                                            let date = new Date(result[i].delivery_date);
                                            ddate = date.toISOString().slice(0, 10);
                                        }

                                        if (result[i].finish == 'requesting') {
                                            visitdate = address = "value = ''";
                                            updatebtn = '';
                                        }
                                        else if (result[i].finish == 'pending') {
                                            visitdate = `value = '${result[i].visited_date}'`;
                                            address = `value = '${result[i].shop_address1}'`;
                                            pendingc = 'checked';
                                            rejectedc = 'disabled';
                                            updatebtn = '';
                                        }
                                        else if (result[i].finish == 'rejected') {
                                            visitdate = `value = '${result[i].visited_date}' disabled`;
                                            address = `value = '${result[i].shop_address1}' disabled`;
                                            rejectedc = 'checked';
                                            pendingc = finishedc = sd = dd = 'disabled';
                                            updatebtn = `style='opacity: 0.6' disabled`;
                                        }
                                        else if (result[i].finish == 'finished') {
                                            visitdate = `value = '${result[i].visited_date}' disabled`;
                                            address = `value = '${result[i].shop_address1}' disabled`;
                                            finishedc = 'checked';
                                            pendingc = sd = dd = rejectedc = 'disabled';
                                            updatebtn = `style='opacity: 0.6' disabled`;
                                        }

                                        
                                        tr += `<form action="/mechanic-dashboard/statusupdate" method="post" id="updateform${i + 1}">
                                        <tr>
                                        <td data-label="S.N.">${i + 1}</td>
                                        <td data-label="Service">${result[i].service}</td>
                                        <td data-label="Request Date">${appoint_date}</td>
                                        <td data-label="Name">${result[i].name}</td>
                                        <td data-label="Email">${result[i].email}</td>
                                        <td data-label="Mobile">${result[i].mob}</td>
                                        <td data-label="Address">${result[i].city}, ${result[i].district}</td>
                                        <td data-label="Schedule date"><input type="date"  name="sdate" ${sd} value="${sdate}" /></td>
                                        <td data-label="Visited"><input type="text" name="visit"  ${visitdate} /></td>
                                        <td data-label="Shop address"><input type="text" name="address" ${address} /></td>
                                        <td data-label="Delivery date"><input type="date"  name="ddate" ${dd} value="${ddate}" /></td>
                                        <td data-label="Status">
                                        <label for="pending${i + 1}"><input type="radio" ${pendingc} id="pending${i + 1}" value = "pending" name="status">Pending</label>
                                        <br />
                                        <label for="finished${i + 1}"><input type="radio" ${finishedc} id="finished${i + 1}" value = "finished" name="status">Finish</label>
                                        <br />
                                        <label for="rejected${i + 1}"><input type="radio" ${rejectedc} id="rejected${i + 1}" value = "rejected" name="status">Reject</label>
                                        <br /></td>
                                        <td data-label="Update"><input type="hidden" name="trackid" value="${result[i].trackid}" /><input type="submit" class="btn3" value="Update" ${updatebtn} /></td>
                                      </tr> </form>`;

                                        sdata += `<script>
                                      document.getElementById('updateform${i + 1}').addEventListener('submit', function (event) {
                                        event.preventDefault();
                            
                                        let form = event.target;
                                        let formData = new FormData(form);
                                        sendform(formData);
                                      });
                                      </script>`;
                                    }

                                    res.render('request', { trackdata: tr, display: "", msgp: "", myscript: sdata });
                                }
                            });
                        }
                        else {
                            res.redirect('/auth');
                        }
                    });
                }
                else {
                    let sq11 = "select * from signup where userid = ?;";
                    req.con.query(sq11, [userid], function (err, result, fields) {
                        if (err) {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            return res.end("404 not found");
                        }

                        if (result.length > 0) {
                            let pdata = {
                                pname: "",
                                pemail: result[0].email,
                                pmob: "",
                                paddress: "",
                            }
                            res.render('profile', { pdata: pdata, trackdata: '<p>none</p>', display: "style='display:none;'" });
                        }
                        else {
                            res.redirect('/');
                        }

                    });
                }
        }
        else {
            res.redirect('/auth');
        }
    }
    catch (error) {
        console.log(error);
        // res.writeHead(404, { 'Content-Type': 'text/html' });
        // return res.end("404 not found");
    }
});


//update

router.post('/statusupdate', mymulter.none(), async (req, res) => {
    try {
        console.log('s1');
        let muserid = req.cookies.userid;
        let trackid = req.body.trackid;
        let sdate = req.body.sdate;
        let ddate = req.body.ddate;
        let visit = req.body.visit;
        let address = req.body.address;
        let status = req.body.status;
        console.log('s2');
        if (sdate == null || sdate == '') {
            sdate = null;
        }
        if (ddate == null || ddate == '') {
            ddate = null;
        }
        if(status == '' && (sdate != null || sdate != '') && (ddate == null || ddate == '')){
            status = 'pending';
        }

        if(status == '' && (sdate != null || sdate != '') && (ddate != null || ddate != '')){
            status = 'pending';
        }



                console.log('s4');
                let sql = `select * from track where muserid = ? and trackid = ?;`;
                req.con.query(sql, [muserid, trackid], (err, result) => {
                    if (err) {
                        
                        res.json({ info: false, error: err });
                        
                        return;
                    }
                    if (result.length == 0) {
                        
                        res.json({ info: false, error: 'No data in track table' });
                        console.log('s5');
                        
                        return;
                    }
                    else {

                        let values = [sdate, visit, address, ddate, status, trackid];

                        let sql = `update track set visiting_date = ?, visited_date = ?, shop_address1 = ?, delivery_date = ?, finish = ? where trackid = ?;`;
                        req.con.query(sql, values, (err, result) => {
                            if (err) {
                                
                                res.json({ info: false, error: err });
                                
                                return;
                            }
                            console.log('s6');
                            res.json({ info: true, error: "Track table updated" });
                            console.log('s7');
                            
                            return;
                        });
                    }
                });
       
    } catch (error) {
        console.log('s8');
        console.error('Error in updatetrack: ', error);
        // res.send(error);
    }
});



module.exports = router;