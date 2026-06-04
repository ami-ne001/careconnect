INSERT INTO operating_rooms (name, status, notes)
SELECT 'OR-1', 'AVAILABLE', 'General surgery suite'
WHERE NOT EXISTS (SELECT 1 FROM operating_rooms WHERE name = 'OR-1');

INSERT INTO operating_rooms (name, status, notes)
SELECT 'OR-2', 'IN_USE', 'Cardiac surgery suite'
WHERE NOT EXISTS (SELECT 1 FROM operating_rooms WHERE name = 'OR-2');

INSERT INTO operating_rooms (name, status, notes)
SELECT 'OR-3', 'AVAILABLE', 'Orthopedic suite'
WHERE NOT EXISTS (SELECT 1 FROM operating_rooms WHERE name = 'OR-3');

INSERT INTO operating_rooms (name, status, notes)
SELECT 'OR-4', 'CLEANING', 'Post-procedure cleaning'
WHERE NOT EXISTS (SELECT 1 FROM operating_rooms WHERE name = 'OR-4');
