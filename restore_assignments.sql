-- Restore Anil Kumble
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-01-BUS-999') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Anil Kumble');

-- Restore Deepak Nair
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-01-OP-0123') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Deepak Nair');

-- Restore Ravi Shankar
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-01-KL-2345') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Ravi Shankar');

-- Restore Prakash N
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-02-D-9900') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Prakash N');

-- Restore Gowda K
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-53-G-1122') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Gowda K');

-- Restore Shivakumar M
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-04-F-8877') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Shivakumar M');

-- Restore Manjunath S
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-51-AB-4321') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Manjunath S');

-- Restore Venkatesh R
UPDATE "Driver" SET "busId" = (SELECT id FROM "Bus" WHERE "numberPlate" = 'KA-01-AF-1234') WHERE "userId" = (SELECT id FROM "User" WHERE name = 'Venkatesh R');
