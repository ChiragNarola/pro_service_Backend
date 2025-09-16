const fs = require('fs');
const path = require('path');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
const envProductionPath = path.join(__dirname, '.env.production');

const envContent = `# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
JWT_EXPIRES_IN=24h

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
BASE_URL=http://localhost:4000
`;

const envProductionContent = `# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
JWT_EXPIRES_IN=24h

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"

# Server Configuration
PORT=4000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
BASE_URL=http://localhost:4000
`;

try {
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file with JWT configuration');
    } else {
        console.log('⚠️  .env file already exists');
    }

    if (!fs.existsSync(envProductionPath)) {
        fs.writeFileSync(envProductionPath, envProductionContent);
        console.log('✅ Created .env.production file with JWT configuration');
    } else {
        console.log('⚠️  .env.production file already exists');
    }

    console.log('\n📝 IMPORTANT: Please update the following in your .env files:');
    console.log('1. Replace DATABASE_URL with your actual database connection string');
    console.log('2. Change JWT_SECRET to a secure random string');
    console.log('3. Update CORS_ORIGIN if needed');
    console.log('\n🚀 After updating, restart your server and try logging in again.');

} catch (error) {
    console.error('❌ Error creating environment files:', error.message);
}
