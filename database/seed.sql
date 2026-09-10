-- Seed initial data for Nexora Prism Database

INSERT INTO users (id, name, email, role, department, title) VALUES
('u1', 'Aarav Sharma', 'ceo@nexora.com', 'CEO', 'Executive', 'Chief Executive Officer'),
('u2', 'Neha Gupta', 'engineering@nexora.com', 'DEPT_HEAD', 'Engineering', 'VP of Engineering'),
('u3', 'Vikram Singh', 'product@nexora.com', 'DEPT_HEAD', 'Product', 'Head of Product'),
('u4', 'Arjun Sharma', 'arjun@nexora.com', 'MANAGER', 'Engineering', 'Lead Architect');

INSERT INTO kpis (id, name, target_val, current_val, unit, trend, weight, status, category) VALUES
('k1', 'Code Review Turnaround', 24.00, 18.00, 'hrs', 'up', 25, 'on_track', 'Engineering'),
('k2', 'Sprint Velocity', 42.00, 47.00, 'pts', 'up', 30, 'on_track', 'Product'),
('k3', 'Bug Escape Rate', 2.00, 1.20, '%', 'up', 20, 'on_track', 'Quality');
