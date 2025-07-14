-- Insert sample users (salespeople)
INSERT INTO users (email, name, role) VALUES
('john.doe@dealership.com', 'John Doe', 'salesperson'),
('jane.smith@dealership.com', 'Jane Smith', 'salesperson'),
('admin@dealership.com', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (make, model, year, price) VALUES
('Toyota', 'Camry', 2024, 28500.00),
('Honda', 'Civic', 2024, 24500.00),
('Ford', 'F-150', 2024, 35000.00),
('BMW', '3 Series', 2024, 42000.00),
('Mercedes-Benz', 'C-Class', 2024, 45000.00),
('Audi', 'A4', 2024, 40000.00),
('Chevrolet', 'Silverado', 2024, 33000.00),
('Nissan', 'Altima', 2024, 26000.00),
('Hyundai', 'Elantra', 2024, 22000.00),
('Volkswagen', 'Jetta', 2024, 25000.00);

-- Insert sample customers
INSERT INTO customers (name, phone, email, city, lead_status, assigned_to) VALUES
('Alice Johnson', '+1-555-0101', 'alice.johnson@email.com', 'New York', 'New', (SELECT id FROM users WHERE email = 'john.doe@dealership.com')),
('Bob Wilson', '+1-555-0102', 'bob.wilson@email.com', 'Los Angeles', 'In Follow-up', (SELECT id FROM users WHERE email = 'jane.smith@dealership.com')),
('Carol Davis', '+1-555-0103', 'carol.davis@email.com', 'Chicago', 'Quoted', (SELECT id FROM users WHERE email = 'john.doe@dealership.com')),
('David Brown', '+1-555-0104', 'david.brown@email.com', 'Houston', 'New', (SELECT id FROM users WHERE email = 'jane.smith@dealership.com')),
('Eva Martinez', '+1-555-0105', 'eva.martinez@email.com', 'Phoenix', 'Closed', (SELECT id FROM users WHERE email = 'john.doe@dealership.com'));

-- Insert sample customer vehicle interests
INSERT INTO customer_vehicle_interests (customer_id, vehicle_id, interest_level) VALUES
((SELECT id FROM customers WHERE email = 'alice.johnson@email.com'), (SELECT id FROM vehicles WHERE make = 'Toyota' AND model = 'Camry'), 'very_interested'),
((SELECT id FROM customers WHERE email = 'bob.wilson@email.com'), (SELECT id FROM vehicles WHERE make = 'BMW' AND model = '3 Series'), 'interested'),
((SELECT id FROM customers WHERE email = 'carol.davis@email.com'), (SELECT id FROM vehicles WHERE make = 'Ford' AND model = 'F-150'), 'very_interested'),
((SELECT id FROM customers WHERE email = 'david.brown@email.com'), (SELECT id FROM vehicles WHERE make = 'Honda' AND model = 'Civic'), 'interested');

-- Insert sample follow-ups
INSERT INTO follow_ups (customer_id, user_id, type, notes, next_action, scheduled_date, status) VALUES
((SELECT id FROM customers WHERE email = 'alice.johnson@email.com'), (SELECT id FROM users WHERE email = 'john.doe@dealership.com'), 'call', 'Initial contact made. Customer interested in Toyota Camry.', 'Schedule test drive', NOW() + INTERVAL '2 days', 'pending'),
((SELECT id FROM customers WHERE email = 'bob.wilson@email.com'), (SELECT id FROM users WHERE email = 'jane.smith@dealership.com'), 'email', 'Sent pricing information for BMW 3 Series.', 'Follow up on pricing questions', NOW() + INTERVAL '1 day', 'pending'),
((SELECT id FROM customers WHERE email = 'carol.davis@email.com'), (SELECT id FROM users WHERE email = 'john.doe@dealership.com'), 'meeting', 'Test drive completed. Customer loved the F-150.', 'Prepare final quote', NOW() + INTERVAL '3 days', 'pending');
