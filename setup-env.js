const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Database
MONGODB_URI=mongodb+srv://aptivoedu_db_user:iGrPsWdXVv3jL2Oi@cluster0.skgqwpp.mongodb.net/?appName=Cluster0

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mathlers-secret-key-change-in-production-use-openssl-rand-base64-32

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Mathlers
`;

const envPath = path.join(__dirname, '.env.local');

fs.writeFileSync(envPath, envContent);

console.log('.env.local file created successfully!');
console.log('Please run: npm run dev');
