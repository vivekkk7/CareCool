const express = require('express');
const router = express.Router();

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
                    res.render('track', ripeuser);
                    console.log("cookie deleted");
                }
                else {
                    res.render('track', rawuser);

                }
            });

        }
        else {
            res.render('track', ripeuser);
        }

    } catch (error) {
        console.error('Error:', error);
        // res.status(500).send('Internal Server Error. Please try again.');
    }
});



//return order data by trackid
router.post('/submit', async (req, res) => {
    let trackid  = req.body.trackId;
    const regex = /^[a-zA-Z0-9]+$/;     //allow only alphabets and numbers
    let tr = ``;

    let userId = req.cookies.userid;

    if(!userId){
        return res.json({ message: 'Please sign in to track your order.', type: 'negative' });
    }

    if (!trackid) {
        return res.json({ message: 'Please enter your track ID.', type: 'negative' });
    }
     else if (!regex.test(trackid)) {
        return res.json({ message: 'Invalid track ID! Only alphabets and numbers are allowed..', type: 'negative' });
    }
     


    try {
        let sq11 = "SELECT appoint.*, track.* FROM appoint JOIN track ON appoint.trackid = track.trackid WHERE appoint.trackid = ? order by appoint_date desc, appoint_time desc;";
        req.con.query(sq11, [trackid], function (err, result, fields) {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end("404 not found");
            }

            if (result.length == 0) {
                return res.json({ message: 'Order not found.', type: 'negative' });
            }
            else {
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

                    tr = `<tr>
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
                return res.json({ message: 'Order found.', type: 'positive', trackData: tr });
            }
        });
            
    } catch (error) {
        console.error('Order not found in the database:', error); // Log the error for debugging
        return res.json({ message: 'Something went wrong. Please try again..', type: 'negative' });
    }
});



module.exports = router;