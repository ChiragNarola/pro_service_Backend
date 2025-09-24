const fs = require('fs');
const path = require('path');

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
CORS_ORIGIN=
BASE_URL=
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
CORS_ORIGIN=
BASE_URL=
`;

try {
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envContent);
    } else {
    }

    if (!fs.existsSync(envProductionPath)) {
        fs.writeFileSync(envProductionPath, envProductionContent);
    } else {
    }

} catch (error) {
    console.error('❌ Error creating environment files:', error.message);
}
