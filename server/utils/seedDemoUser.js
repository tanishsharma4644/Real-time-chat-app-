const User = require('../models/User');

const seedDemoUser = async () => {
  const email = 'demo@chat.com';
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return;
  }

  await User.create({
    username: 'Demo User',
    email,
    password: 'demo123',
    avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
  });

  console.log('Seeded demo user: demo@chat.com / demo123');
};

module.exports = seedDemoUser;
