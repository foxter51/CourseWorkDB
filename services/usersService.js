const db = require(__dirname + '/../database')
const bcrypt = require("bcrypt");

module.exports = {
    authorizeUser : function (userEmail, userPass, req, res){
        if(userEmail && userPass){
            db.query(`SELECT Pass From Users WHERE Email = '${userEmail}'`, function (err, data){  //find Pass to compare
                try {
                    if(err) throw err  //if not exists
                    else{
                        bcrypt.compare(userPass, data[0].Pass, function(err, result) {  //hash the entered pass and compare it to existing from db
                            if (result) {  //if success
                                req.session.userEmail = userEmail  //set session
                                res.redirect('/')
                            }
                            else res.render('error', {error: 'Incorrect password!'})
                        })
                    }
                }
                catch (err){
                    res.render('error', {error: 'Incorrect credentials!'})  //if error -> error page render
                }
            })
        }
    },

    registerUser : function (userEmail, userPass, req, res){
        if(userEmail && userPass){
            bcrypt.hash(userPass, 10, function(err, hash) {  //hash the password
                db.query(`INSERT INTO Users(Email, Pass) VALUES ('${userEmail}', '${hash}')`, function (err){  //add user to DB
                    try {
                        if(err) throw err  //if exists
                        else{
                            req.session.userEmail = userEmail  //set session
                            res.redirect('/')
                        }
                    }
                    catch (err){
                        res.render('error', {error: 'This user is already registered!'})  //if error -> error page render
                    }
                })
            });
        }
    }
}