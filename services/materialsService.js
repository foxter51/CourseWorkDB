const db = require(__dirname + '/../database')

module.exports = {
    selectQueryWithNoOptionsExecutor : function (query, tableName, req, res){  //select query with no options to be inserted
        db.query(`SHOW COLUMNS FROM ${tableName}; ${query}`, [1, 2], function (err, data) {  //select columns names and its values
            try {
                if(err) throw err
                else res.render('index', {tableHeader: tableName, names: data[0], values: data[1], session: req.session})  //if success -> render page with results
            }
            catch (err){
                res.render('error', {error: err.message})  //if error -> error page render
            }
        })
    },

    selectQueryWithAllOptionsExecutor : function (query, tableName, req, res){  //select queries with all options to be inserted
        db.query(   `   SHOW COLUMNS FROM ${tableName}; ${query};
                        SELECT * FROM stylesList;
                        SELECT * FROM materialsList;
                        SELECT * FROM unitsList`, [1, 2, 3, 4, 5], function (err, data) {  //select columns names, its values and [styles, materials, units] to be inserted as options
            try {
                if(err) throw err
                else res.render('index', {  tableHeader: tableName, names: data[0], values: data[1], styles: data[2],
                    materials: data[3], units: data[4], session: req.session})  //if success -> render page with results
            }
            catch (err){
                res.render('error', {error: err.message})  //if error -> error page render
            }
        })
    },

    selectQueryWithPartialOptionsExecutor : function (query, tableName, req, res){  //select queries with two options to be inserted
        db.query(   `   SHOW COLUMNS FROM ${tableName}; ${query}; 
                        SELECT * FROM materialsList; 
                        SELECT * FROM unitsList`, [1, 2, 3, 4], function (err, data) {  //select columns names, its values and [materials, units] to be inserted as options
            try {
                if(err) throw err
                else res.render('index', {tableHeader: tableName, names: data[0],
                    values: data[1], materials: data[2], units: data[3], session: req.session})  //if success -> render page with results
            }
            catch (err){
                res.render('error', {error: err.message})  //if error -> error page render
            }
        })
    },

    removeQueryExecutor : function (tableName, ID, res){  //remove query by table name and record id
        db.query(`CALL removeData('${tableName}', ${ID})`, function (err){
            try {
                if(err) throw err
                else res.redirect('back')  //if success -> page reload
            }
            catch (err){
                res.render('error', {error: err.message})  //if error -> error page render
            }
        })
    },

    insertUpdateQueryExecutor : function (query, res){  //insert query
        db.query(query, function (err){
            try {
                if(err) throw err
                else res.redirect('back')  //if success -> page reload
            }
            catch (err){
                res.render('error', {error: err.message})  //if error -> error page render
            }
        })
    },

    getRestQueryExecutor : function (res){
        db.query('CALL getRest()', function (err){
            try {
                if(err) throw err
            }
            catch (err){
                res.render('error', {error: err.message})  //if error -> error page render
            }
        })
    }
}