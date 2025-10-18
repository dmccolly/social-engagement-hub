# Social Engagement Hub

A comprehensive platform for managing blog content and email marketing campaigns.

## Features

### Blog System
- Rich text editor with TipTap
- Image upload with Cloudinary
- Post management (create, edit, delete)
- Blog widget for embedding
- Xano backend integration

### Email Marketing System (Phase 1 - In Development)
- Contact management
- Group organization
- Email campaign builder (coming soon)
- SendGrid integration (coming soon)
- Analytics dashboard (coming soon)

## Quick Start

### Prerequisites
- Node.js 18+
- Xano account
- Cloudinary account (for blog images)
- SendGrid account (for email sending)

### Installation

```bash
# Clone the repository
git clone https://github.com/dmccolly/social-engagement-hub.git
cd social-engagement-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Xano and Cloudinary credentials

# Start development server
npm start
```

### Environment Variables

```env
REACT_APP_XANO_BASE_URL=your-xano-api-url
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Documentation

### Setup Guides
- [Email System Setup](docs/setup/EMAIL_SYSTEM_README.md)
- [Xano Complete Setup](docs/setup/XANO_COMPLETE_SETUP.md)
- [Required API Endpoints](docs/setup/REQUIRED_ENDPOINTS.md)
- [Final Setup Steps](docs/setup/FINAL_SETUP_STEPS.md)

### Testing & Deployment
- [Testing Report](docs/testing/TESTING_REPORT.md)
- [Deployment Status](docs/testing/DEPLOYMENT_STATUS.md)

### Project Management
- [Next Steps](docs/NEXT_STEPS.md)
- [Current Todo](todo.md)

## Project Structure

```
social-engagement-hub/
├── src/
│   ├── components/
│   │   ├── email/          # Email system components
│   │   └── ...             # Blog components
│   ├── services/
│   │   ├── email/          # Email API services
│   │   └── xanoService.js  # Blog API service
│   └── App.js
├── docs/
│   ├── setup/              # Setup documentation
│   ├── testing/            # Testing documentation
│   └── archive/            # Archived old docs
├── build/                  # Production build
└── README.md
```

## Development

### Active Branches
- `main` - Production branch
- `feature/email-system` - Email system development

### Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## Deployment

The application is deployed on Netlify:
- **Production**: https://gleaming-cendol-417bf3.netlify.app
- **Preview**: https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Wait for review and approval

## Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the [Testing Report](docs/testing/TESTING_REPORT.md)
3. Check [Current Todo](todo.md) for known issues

## License

Private project - All rights reserved

## Changelog

### 2025-10-12
- ✅ Repository cleanup completed
- ✅ Removed 17 old branches
- ✅ Archived 52 old documentation files
- ✅ Organized documentation into `/docs` structure
- ✅ Created backup archive (94MB)

### 2025-10-11
- ✅ Email system Phase 1 completed
- ✅ Contact management interface built
- ✅ Mock Xano server created for testing
- ✅ Pull Request #15 created

### Earlier
- ✅ Blog system with rich editor
- ✅ Xano integration
- ✅ Cloudinary image uploads
- ✅ Blog widget for embedding