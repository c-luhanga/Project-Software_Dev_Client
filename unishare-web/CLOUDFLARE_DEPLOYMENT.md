# Cloudflare Pages Deployment Instructions
# 
# Environment Variables to set in Cloudflare Pages Dashboard:
# Settings -> Environment variables -> Production

# API Configuration
VITE_API_BASE_URL=https://unishareapp.runasp.net/api
VITE_API_BASE_URL_SIGNALR=https://unishareapp.runasp.net

# Application Settings
VITE_APP_TITLE=UniShare
VITE_ENVIRONMENT=production
VITE_MAX_FILE_SIZE_MB=5
VITE_MAX_IMAGES_PER_ITEM=4
VITE_DEBUG_API=false

# Build Configuration
# Framework preset: Vite
# Build command: npm run build
# Output directory: dist
# Root directory: unishare-web (if in monorepo)

# Custom Domain Configuration (if needed)
# Add custom domain in Cloudflare Pages -> Custom domains
# Update CORS in API Program.cs with your custom domain

# Deployment Steps:
# 1. Connect GitHub repository to Cloudflare Pages
# 2. Set build configuration above
# 3. Add environment variables above
# 4. Deploy and test

# Testing Checklist:
# [ ] API health check: https://unishareapp.runasp.net
# [ ] Swagger UI: https://unishareapp.runasp.net/swagger
# [ ] Frontend loads: https://unishare.pages.dev
# [ ] User registration works
# [ ] User login works
# [ ] Item creation works
# [ ] Real-time messaging works
# [ ] No CORS errors in browser console