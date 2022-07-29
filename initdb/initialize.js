// @ts-nocheck
db.createCollection('users');
db.users.insertOne({
  username: 'admin',
  email: 'admin@admin.com',
  password: '$2b$10$D5xuub32dNxuBeUj3xRbquCjWcpfGYCFYSXGxfkJSnWHoxhkaXdYy',
  profile: '1',
});
