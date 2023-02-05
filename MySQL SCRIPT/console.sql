use materialsaccounting;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1337';

CREATE TABLE Styles(
ID INT PRIMARY KEY AUTO_INCREMENT,
Style VARCHAR(7) UNIQUE NOT NULL
);

CREATE TABLE RawMaterials(
ID INT PRIMARY KEY AUTO_INCREMENT,
RawMaterial VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE Units(
ID INT PRIMARY KEY AUTO_INCREMENT,
Unit VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE Heels (
ID INT PRIMARY KEY AUTO_INCREMENT,
Style INT,
RawMaterial INT,
Quantity FLOAT DEFAULT 0,
Unit INT,
FOREIGN KEY (Style)
	REFERENCES Styles(ID)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(RawMaterial)
	REFERENCES RawMaterials(ID)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(Unit)
	REFERENCES Units(ID)
ON UPDATE CASCADE
ON DELETE CASCADE
);

CREATE TABLE Soles (
ID INT PRIMARY KEY AUTO_INCREMENT,
Style INT,
RawMaterial INT,
Quantity FLOAT DEFAULT 0,
Unit INT,
FOREIGN KEY (Style)
	REFERENCES Styles(ID)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(RawMaterial)
	REFERENCES RawMaterials(ID)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(Unit)
	REFERENCES Units(ID)
ON UPDATE CASCADE
ON DELETE CASCADE
);

CREATE TABLE Linings (
ID INT PRIMARY KEY AUTO_INCREMENT,
Style INT,
RawMaterial INT,
Quantity FLOAT DEFAULT 0,
Unit INT,
FOREIGN KEY (Style)
	REFERENCES Styles(ID)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(RawMaterial)
	REFERENCES RawMaterials(ID)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(Unit)
	REFERENCES Units(ID)
ON UPDATE CASCADE
ON DELETE CASCADE
);

CREATE TABLE MaterialsWarehouse (
ID INT PRIMARY KEY AUTO_INCREMENT,
RawMaterial INT UNIQUE,
Quantity FLOAT DEFAULT 0,
Unit INT,
FOREIGN KEY(RawMaterial)
	REFERENCES RawMaterials(ID)
ON UPDATE CASCADE
ON DELETE CASCADE,
FOREIGN KEY(Unit)
	REFERENCES Units(ID)
ON UPDATE CASCADE
ON DELETE CASCADE
);

CREATE TABLE Users (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(256) UNIQUE NOT NULL,
    Pass VARCHAR(64) NOT NULL
);

INSERT INTO Styles(Style)
VALUES
('4568-y9'),
('6789-y5'),
('8769-y3'),
('9791-y2');

INSERT INTO RawMaterials(RawMaterial)
VALUES
('PVC'),
('kapron'),
('nails'),
('metal linings'),
('glue'),
('tare'),
('polyurethane'),
('leather'),
('aluminum'),
('plastic');

INSERT INTO Units(Unit)
VALUES
('kg/unit'),
('pieces'),
('pairs'),
('kg'),
('square meters');

INSERT INTO Heels(Style, RawMaterial, Quantity, Unit)
VALUES
(1, 1, 0.05, 1),
(1, 2, 0.07, 1),
(1, 3, 6, 2),
(1, 4, 2, 3),
(1, 5, 0.05, 4),
(1, 6, 0.01, 2),
(2, 1, 0.06, 1),
(2, 2, 0.08, 1),
(2, 3, 8, 2),
(2, 7, 10, 1),
(2, 4, 2, 3),
(2, 5, 0.06, 4)
;

INSERT INTO Soles(Style, RawMaterial, Quantity, Unit)
VALUES
(3, 7, 0.25, 1),
(3, 1, 0.10, 1),
(3, 3, 10, 2)
;

INSERT INTO Linings(Style, RawMaterial, Quantity, Unit)
VALUES
(4, 8, 1, 5),
(4, 9, 0.05, 1),
(4, 10, 0.02, 1)
;

INSERT INTO MaterialsWarehouse(RawMaterial, Quantity, Unit)
VALUES
(1, 300, 1),
(2, 100, 1),
(3, 500, 2),
(4, 250, 3),
(5, 140, 4),
(6, 40, 2),
(7, 240, 1),
(8, 260, 5),
(9, 210, 1),
(10, 410, 1)
;

#procedure to remove data from any table by record id
CREATE PROCEDURE removeData(IN tableName VARCHAR(32), IN id VARCHAR(5))
BEGIN
    SET @removeQuery = CONCAT('DELETE FROM ', tableName, ' WHERE ID = ', id);
    PREPARE removeStatement FROM @removeQuery;
    EXECUTE removeStatement;
    DEALLOCATE PREPARE removeStatement;
END;

#views are used as a possible list of parameters to be inserted in a new record
CREATE VIEW stylesList AS
    SELECT * FROM Styles;

CREATE VIEW materialsList AS
    SELECT * FROM RawMaterials;

CREATE VIEW unitsList AS
    SELECT * FROM Units;

#view contains material type and its quantity from all the tables
CREATE VIEW Quantities AS (SELECT RawMaterial, Quantity FROM Heels) UNION
                                                                    (SELECT RawMaterial, Quantity FROM Soles) UNION
                                                                                                              (SELECT RawMaterial, Quantity FROM Linings);

#procedure compare total quantity in tables to warehouse quantity
CREATE PROCEDURE checkQuantity(IN newMaterialID INT)
BEGIN
    DECLARE currentMaterialID INT;
    DECLARE currentMaterialQuantity FLOAT;  #current material quantity in the warehouse

    DECLARE done INT DEFAULT FALSE;
    DECLARE materialID CURSOR FOR SELECT RawMaterial FROM MaterialsWarehouse;  #material ids from warehouse
    DECLARE materialQuantity CURSOR FOR SELECT Quantity FROM MaterialsWarehouse;  #material quantities from warehouse
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN materialID;
    OPEN materialQuantity;

    scroll_loop: LOOP  #loop to compare materials quantity in plans to materials quantity in warehouse
	FETCH materialID INTO currentMaterialID;
	FETCH materialQuantity INTO currentMaterialQuantity;

    #if material quantity in plans > material quantity in warehouse or not present -> prevent insert
	IF (((SELECT COUNT(ID) FROM MaterialsWarehouse WHERE RawMaterial = newMaterialID) = 0)
	        OR
	    ((SELECT SUM(Quantity) FROM Quantities WHERE RawMaterial = currentMaterialID) > currentMaterialQuantity)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough materials!';
    END IF;

	IF done THEN
		LEAVE scroll_loop;
	END IF;
    END LOOP scroll_loop;

    CLOSE materialID;
    CLOSE materialQuantity;
END;

#triggers restrict to specify more than there are materials on warehouse
CREATE TRIGGER heels_quantity_restrict_insert
AFTER INSERT ON Heels
FOR EACH ROW
BEGIN
CALL checkQuantity(NEW.RawMaterial);
END;

CREATE TRIGGER heels_quantity_restrict_update
AFTER UPDATE ON Heels
FOR EACH ROW
BEGIN
CALL checkQuantity(NEW.RawMaterial);
END;

CREATE TRIGGER soles_quantity_restrict_insert
AFTER INSERT ON Soles
FOR EACH ROW
BEGIN
CALL checkQuantity(NEW.RawMaterial);
END;

CREATE TRIGGER soles_quantity_restrict_update
AFTER UPDATE ON Soles
FOR EACH ROW
BEGIN
CALL checkQuantity(NEW.RawMaterial);
END;

CREATE TRIGGER linings_quantity_restrict_insert
AFTER INSERT ON Linings
FOR EACH ROW
BEGIN
CALL checkQuantity(NEW.RawMaterial);
END;

CREATE TRIGGER linings_quantity_restrict_update
AFTER UPDATE ON Linings
FOR EACH ROW
BEGIN
CALL checkQuantity(NEW.RawMaterial);
END;

CREATE TRIGGER warehouse_quantity_restrict_delete
AFTER DELETE ON MaterialsWarehouse  #prevent delete
FOR EACH ROW
BEGIN
    IF((SELECT COUNT(RawMaterial) FROM Quantities WHERE RawMaterial = OLD.RawMaterial) > 0) THEN  #if material is still in use
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This material is still in use!';
    END IF;
END;

CREATE TRIGGER warehouse_quantity_restrict_update
AFTER UPDATE ON MaterialsWarehouse
FOR EACH ROW
BEGIN
    CALL checkQuantity(NEW.RawMaterial);
END;

#procedure to create temp table of the rest of materials
CREATE PROCEDURE getRest()
BEGIN
    DECLARE currentMaterialID FLOAT;
    DECLARE currentMaterial VARCHAR(20);

    DECLARE done INT DEFAULT FALSE;
    DECLARE materials CURSOR FOR SELECT RawMaterial FROM Quantities;  #cursor on RawMaterial field
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    CREATE TEMPORARY TABLE RestMaterials(  #temp table of the rest of materials
        RawMaterial VARCHAR(20),
        Quantity FLOAT
    );

    OPEN materials;

    scroll_loop: LOOP
	FETCH materials INTO currentMaterialID;  #get current material id

	SET currentMaterial = (SELECT RawMaterial FROM RawMaterials WHERE ID = currentMaterialID);  #get its name

	INSERT INTO RestMaterials VALUES  #fill the table with material name and its rest
	    (currentMaterial,
	     (SELECT Quantity FROM MaterialsWarehouse m WHERE m.RawMaterial = currentMaterialID)
	         -
	     (SELECT SUM(Quantity) FROM Quantities WHERE RawMaterial = currentMaterialID));

	IF done THEN
		LEAVE scroll_loop;
	END IF;

    END LOOP scroll_loop;

    CLOSE materials;
END;