#!/usr/bin/env node

// UniShare Frontend Deployment Checker
// Verifies environment variables and build readiness

const fs = require('fs');
const path = require('path');

console.log('🔍 UniShare Frontend Deployment Checker\n');

// Check package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Are you in the project root?');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log(`✅ Project: ${packageJson.name}`);
console.log(`✅ Version: ${packageJson.version}`);

// Check for required scripts
const requiredScripts = ['dev', 'build', 'preview'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);

if (missingScripts.length > 0) {
    console.error(`❌ Missing scripts: ${missingScripts.join(', ')}`);
    process.exit(1);
}
console.log('✅ Required scripts found');

// Check environment files
const envFiles = ['.env.local', '.env.production', '.env.development'];
const existingEnvFiles = envFiles.filter(file => fs.existsSync(file));

console.log('\n📄 Environment files:');
existingEnvFiles.forEach(file => {
    console.log(`✅ ${file} found`);
});

if (existingEnvFiles.length === 0) {
    console.warn('⚠️  No environment files found. Create .env.local for development');
}

// Check for required dependencies
const requiredDeps = [
    '@types/react',
    'typescript',
    'vite'
];

const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
);

if (missingDeps.length > 0) {
    console.error(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    process.exit(1);
}
console.log('✅ Required dependencies found');

// Check TypeScript config
const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsConfigPath)) {
    console.warn('⚠️  tsconfig.json not found');
} else {
    console.log('✅ TypeScript configuration found');
}

// Check Vite config
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (!fs.existsSync(viteConfigPath)) {
    console.warn('⚠️  vite.config.ts not found');
} else {
    console.log('✅ Vite configuration found');
}

// Check for common deployment files
const deploymentFiles = [
    '.cloudflare-pages.toml',
    '_redirects',
    'public/_redirects'
];

console.log('\n📦 Deployment files:');
deploymentFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} found`);
    }
});

// Environment variable recommendations
console.log('\n🔧 Cloudflare Pages Environment Variables to set:');
console.log('Required variables:');
console.log('  VITE_API_BASE_URL=https://your-project.monsterasp.net/api');
console.log('  VITE_API_BASE_URL_SIGNALR=https://your-project.monsterasp.net');
console.log('  VITE_ENVIRONMENT=production');
console.log('\nOptional variables:');
console.log('  VITE_MAX_FILE_SIZE_MB=5');
console.log('  VITE_MAX_IMAGES_PER_ITEM=4');
console.log('  VITE_DEBUG_API=false');

// Build readiness check
console.log('\n🏗️  Build readiness:');
try {
    const { execSync } = require('child_process');
    
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
        console.warn('⚠️  node_modules not found. Run: npm install');
    } else {
        console.log('✅ node_modules found');
    }
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 16) {
        console.log(`✅ Node.js ${nodeVersion} (compatible)`);
    } else {
        console.warn(`⚠️  Node.js ${nodeVersion} (recommend 18+)`);
    }
    
} catch (error) {
    console.error('❌ Build environment check failed:', error.message);
}

console.log('\n🚀 Next steps for deployment:');
console.log('1. Push your code to GitHub');
console.log('2. Connect repository to Cloudflare Pages');
console.log('3. Set environment variables in Cloudflare dashboard');
console.log('4. Deploy and test!');

console.log('\n✅ Frontend deployment check complete!');