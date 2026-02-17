const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const User = mongoose.connection.collection('users');
    
    // Step 1: Clean up null values
    console.log('\n📋 Cleaning up null values...');
    const updateResult = await User.updateMany(
      { email: null },
      { $unset: { email: "" } }
    );
    console.log(`✅ Cleaned ${updateResult.modifiedCount} users with null email`);
    
    const phoneUpdateResult = await User.updateMany(
      { phoneNumber: null },
      { $unset: { phoneNumber: "" } }
    );
    console.log(`✅ Cleaned ${phoneUpdateResult.modifiedCount} users with null phoneNumber`);
    
    // Step 2: Drop old indexes
    console.log('\n📋 Dropping old indexes...');
    try {
      await User.dropIndex('email_1');
      console.log('✅ Dropped old email_1 index');
    } catch (e) {
      console.log('⚠️  email_1 index not found');
    }
    
    try {
      await User.dropIndex('phoneNumber_1');
      console.log('✅ Dropped old phoneNumber_1 index');
    } catch (e) {
      console.log('⚠️  phoneNumber_1 index not found');
    }
    
    // Step 3: Create new sparse indexes
    console.log('\n📋 Creating new sparse indexes...');
    await User.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse email index');
    
    await User.createIndex({ phoneNumber: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse phoneNumber index');
    
    // Step 4: Show final indexes
    const indexes = await User.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${JSON.stringify(index.key)}`);
    });
    
    console.log('\n🎉 All done! Restart your server now.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndexes();