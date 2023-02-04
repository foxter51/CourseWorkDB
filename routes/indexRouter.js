const express = require('express')
const router = express.Router()
const urlencodedParser = express.urlencoded({extended: false})
const session = require('express-session')
const materialsService = require(__dirname + '/../services/materialsService')
const usersService = require(__dirname + '/../services/usersService')

router.use(session({
    secret: 'coursework',
    resave: true,
    saveUninitialized: true
}))

router.get('/', (req, res) =>{
    res.render('index', {tableHeader: null, session: req.session})
})

router.post('/login', urlencodedParser, (req, res) =>{  //login attempt
    let userEmail = req.body.user_email  //user credentials
    let userPass = req.body.user_password
    usersService.authorizeUser(userEmail, userPass, req, res)
})

router.post('/register', urlencodedParser, (req, res) =>{  //register attempt
    let userEmail = req.body.user_email  //user credentials
    let userPass = req.body.user_password
    usersService.registerUser(userEmail, userPass, req, res)
})

router.get('/logout', (req, res) =>{
    req.session.destroy()
    res.redirect('back')
})

router.get('/styles', (req, res) =>{
    materialsService.selectQueryWithNoOptionsExecutor('SELECT * FROM Styles ORDER BY ID', 'Styles', req, res)
})

router.get('/raw_materials', (req, res) =>{
    materialsService.selectQueryWithNoOptionsExecutor('SELECT * FROM RawMaterials ORDER BY ID', 'RawMaterials', req, res)
})

router.get('/units', (req, res) =>{
    materialsService.selectQueryWithNoOptionsExecutor('SELECT * FROM Units ORDER BY ID', 'Units', req, res)
})

router.get('/heels', (req, res) =>{  //select query with replacing foreign keys with normal names
    materialsService.selectQueryWithAllOptionsExecutor(   'SELECT h.ID, s.Style, r.RawMaterial, h.Quantity, u.Unit\n' +
                                                                'FROM Heels h\n' +
                                                                'INNER JOIN Styles s ON h.Style = s.ID\n' +
                                                                'INNER JOIN RawMaterials r ON h.RawMaterial = r.ID\n' +
                                                                'INNER JOIN Units u ON h.Unit = u.ID\n' +
                                                                'ORDER BY h.ID\n', 'Heels', req, res)
})

router.get('/soles', (req, res) =>{
    materialsService.selectQueryWithAllOptionsExecutor(   'SELECT so.ID, s.Style, r.RawMaterial, so.Quantity, u.Unit\n' +
                                                                'FROM Soles so\n' +
                                                                'INNER JOIN Styles s ON so.Style = s.ID\n' +
                                                                'INNER JOIN RawMaterials r ON so.RawMaterial = r.ID\n' +
                                                                'INNER JOIN Units u ON so.Unit = u.ID\n' +
                                                                'ORDER BY so.ID\n', 'Soles', req, res)
})

router.get('/linings', (req, res) =>{
    materialsService.selectQueryWithAllOptionsExecutor(   'SELECT l.ID, s.Style, r.RawMaterial, l.Quantity, u.Unit\n' +
                                                                'FROM Linings l\n' +
                                                                'INNER JOIN Styles s ON l.Style = s.ID\n' +
                                                                'INNER JOIN RawMaterials r ON l.RawMaterial = r.ID\n' +
                                                                'INNER JOIN Units u ON l.Unit = u.ID\n' +
                                                                'ORDER BY l.ID\n', 'Linings', req, res)
})

router.get('/materials_warehouse', (req, res) =>{
    materialsService.selectQueryWithPartialOptionsExecutor(   'SELECT m.ID, r.RawMaterial, m.Quantity, u.Unit\n' +
                                                                    'FROM MaterialsWarehouse m\n' +
                                                                    'INNER JOIN RawMaterials r ON m.RawMaterial = r.ID\n' +
                                                                    'INNER JOIN Units u ON m.Unit = u.ID\n' +
                                                                    'ORDER BY m.ID\n', 'MaterialsWarehouse', req, res)
})

router.get('/rest_materials', (req, res) =>{
    materialsService.getRestQueryExecutor(res);
    materialsService.selectQueryWithNoOptionsExecutor('SELECT DISTINCT RawMaterial, Quantity FROM RestMaterials ORDER BY Quantity;\n' +
                                                            'DROP TEMPORARY TABLE IF EXISTS RestMaterials', 'RestMaterials', req, res)
})

router.post('/remove_record', urlencodedParser, (req, res) =>{
    materialsService.removeQueryExecutor(req.body.TablePlusID.split(' ')[0], req.body.TablePlusID.split(' ')[1], res)
})

router.post('/add_record_Styles', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(  `INSERT INTO Styles (Style) VALUES ('${req.body.Style}')`, res)
})

router.post('/add_record_RawMaterials', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(`INSERT INTO RawMaterials (RawMaterial) VALUES ('${req.body.RawMaterial}')`, res)
})

router.post('/add_record_Units', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(`INSERT INTO Units (Unit) VALUES ('${req.body.Unit}')`, res)
})

router.post('/add_record_Heels', urlencodedParser, (req, res) =>{  //adding record with corresponding foreign keys
    materialsService.insertUpdateQueryExecutor(`INSERT INTO Heels (Style, RawMaterial, Quantity, Unit) VALUES
                                                (${req.body.Style}, ${req.body.RawMaterial}, ${req.body.Quantity}, ${req.body.Unit})`, res)
})

router.post('/add_record_Soles', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(`INSERT INTO Soles (Style, RawMaterial, Quantity, Unit) VALUES
                                                (${req.body.Style}, ${req.body.RawMaterial}, ${req.body.Quantity}, ${req.body.Unit})`, res)
})

router.post('/add_record_Linings', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(`INSERT INTO Linings (Style, RawMaterial, Quantity, Unit) VALUES
                                                (${req.body.Style}, ${req.body.RawMaterial}, ${req.body.Quantity}, ${req.body.Unit})`, res)
})

router.post('/add_record_MaterialsWarehouse', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(`INSERT INTO MaterialsWarehouse (RawMaterial, Quantity, Unit) VALUES
                                                (${req.body.RawMaterial}, ${req.body.Quantity}, ${req.body.Unit})`, res)
})

router.post('/edit_record_Styles', urlencodedParser, (req, res) =>{  //updating records
    materialsService.insertUpdateQueryExecutor(  `UPDATE Styles
                                                        SET Style = '${req.body.Style}'
                                                        WHERE ID = ${req.body.ID}`, res)
})

router.post('/edit_record_RawMaterials', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(  `UPDATE RawMaterials
                                                        SET RawMaterial = '${req.body.RawMaterial}'
                                                        WHERE ID = ${req.body.ID}`, res)
})

router.post('/edit_record_Units', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(  `UPDATE Units
                                                        SET Unit = '${req.body.Unit}'
                                                        WHERE ID = ${req.body.ID}`, res)
})

router.post('/edit_record_Heels', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(   `UPDATE Heels
                                                         SET Style = ${req.body.Style},
                                                         RawMaterial = ${req.body.RawMaterial},
                                                         Quantity = ${req.body.Quantity},
                                                         Unit = ${req.body.Unit}
                                                         WHERE ID = ${req.body.ID}`, res)
})

router.post('/edit_record_Soles', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(   `UPDATE Soles
                                                         SET Style = ${req.body.Style},
                                                         RawMaterial = ${req.body.RawMaterial},
                                                         Quantity = ${req.body.Quantity},
                                                         Unit = ${req.body.Unit}
                                                         WHERE ID = ${req.body.ID}`, res)
})

router.post('/edit_record_Linings', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(    `UPDATE Linings
                                                         SET Style = ${req.body.Style},
                                                         RawMaterial = ${req.body.RawMaterial},
                                                         Quantity = ${req.body.Quantity},
                                                         Unit = ${req.body.Unit}
                                                         WHERE ID = ${req.body.ID}`, res)
})

router.post('/edit_record_MaterialsWarehouse', urlencodedParser, (req, res) =>{
    materialsService.insertUpdateQueryExecutor(    `UPDATE Heels
                                                         SET RawMaterial = ${req.body.RawMaterial},
                                                         Quantity = ${req.body.Quantity},
                                                         Unit = ${req.body.Unit}
                                                         WHERE ID = ${req.body.ID}`, res)
})
module.exports = router