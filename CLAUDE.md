# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Pages static website for BPMspace GmbH, a Munich-based business process management consulting company. The site showcases their agile BPM services, partners (ICO, mITSM), and their SecureOnlineExam (SOE) product with AI-powered proctoring.

## Architecture

### Main Website Structure

**Important**: All website content lives in the `/www` directory, which is the only directory published to GitHub Pages.

- **www/index.html**: Single-page application (SPA) with Bootstrap 4 template
  - Header with sticky navigation using custom `u-header` components
  - Multiple sections: Home (carousel), About, Developer (job posting), Partners, Contact
  - Uses Unify template framework (custom CSS classes prefixed with `g-` and `u-`)
  - All sections are on one page using anchor-based navigation (#home, #about, etc.)

### Asset Organization

- **www/assets/css/**: Stylesheets organized by purpose
  - `styles.op-business.css`: Main template styles
  - `custom.css`: Site-specific customizations
  - Third-party: Bootstrap, Font Awesome, Slick carousel, hamburgers menu

- **www/assets/js/**: JavaScript modules
  - `hs.*.js`: Unify "HTML Stream" component modules (header, carousel, scroll navigation, etc.)
  - Third-party: jQuery, Bootstrap, Slick, GMaps
  - No custom application logic - all functionality is template-driven

### Sub-sections

- **www/SOE/**: SecureOnlineExam product demo
  - Contains video player (`SOE_player.html`) with TechSmith Smart Player
  - Self-contained video presentation with config XML

- **www/3756635456442343545444325323/**: Photo gallery (ChrisCraft boat images)
  - `ChrisCraft.html`: Bootstrap carousel gallery (static HTML)
  - `createhtml.php`: **Local-only** generator script for carousel HTML from images
  - Script runs locally via Docker to generate static HTML: `docker run -v $(pwd):/app/ php:8.0-cli php /app/createhtml.php > ChrisCraft.html`
  - **Important**: GitHub Pages serves only static files (HTML/CSS/JS), no server-side execution

## Development Workflow

### Publishing Changes

This is a **GitHub Pages static site** using GitHub Actions for deployment.

**Critical**:
- GitHub Pages only serves static files (HTML, CSS, JavaScript, images)
- No server-side code (PHP, Python, etc.) runs in production
- **Only the `/www` directory is published** to GitHub Pages (configured in `.github/workflows/pages.yml`)
- Any dynamic content must be pre-generated locally before committing

```bash
# Make changes to files in /www directory
git add www/
git commit -m "Description of changes"
git push origin master
# GitHub Actions workflow automatically deploys /www to GitHub Pages
```

The workflow is triggered on every push to master and publishes only the `www/` directory content.

### Regenerating Photo Gallery

When adding images to `3756635456442343545444325323/img/`:

```bash
cd 3756635456442343545444325323
docker run -v $(pwd):/app/ php:8.0-cli php /app/createhtml.php > ChrisCraft.html
cd ..
git add 3756635456442343545444325323/ChrisCraft.html
git commit -m "Updated photo gallery"
git push origin master
```

### Testing Locally

This project uses **Caddy** as a reverse proxy with Docker Compose. There are two environments:

#### Development Environment (DEV)
Uses mounted volumes for live editing:

```bash
# Start DEV environment with mounted volumes
docker compose -f docker-compose.DEV.yml up -d --build

# Access via Caddy reverse proxy
# URL: https://training.dev.bpmspace.net
```

#### Test Environment (TEST)
Uses files baked into the image (no mounted volumes):

```bash
# Start TEST environment without mounted volumes
docker compose -f docker-compose.TEST.yml up -d --build

# Access via Caddy reverse proxy
# URL: https://training.test.bpmspace.net
```

To stop either environment:

```bash
# Stop DEV
docker compose -f docker-compose.DEV.yml down

# Stop TEST
docker compose -f docker-compose.TEST.yml down
```

**Important**: Both environments connect to an external Caddy network that handles SSL/TLS termination and routing based on Docker labels. Do NOT start a separate Caddy server - there is already a Caddy reverse proxy running externally.

### Docker Setup Details

The project uses:
- **Dockerfile**: Builds an nginx:alpine image with the website files
- **docker-compose.DEV.yml**: DEV environment with mounted volumes (`./www/:/var/www/html/`) for live editing
- **docker-compose.TEST.yml**: TEST environment with files baked into the image (no volumes)

Both compose files:
- Build the same Dockerfile
- Use hostname `training` and container name `training`
- Connect to two networks: `training` (bridge) and `caddy` (external)
- Set Caddy labels for automatic routing:
  - DEV: `training.dev.bpmspace.net`
  - TEST: `training.test.bpmspace.net`

The external Caddy server reads these labels and automatically routes HTTPS traffic to the container.

## Key Technical Details

### Unify Template Framework

The site uses the Unify HTML template with a specific component architecture:

- **u-header**: Sticky header with scroll detection
- **hs-icon**: Icon components
- **js-carousel**: Slick carousel wrapper
- **g-* classes**: Grid and utility classes (g-theme-bg-*, g-color-*, g-py-*, etc.)

Component initialization happens in inline `<script>` tags at the bottom of `index.html` using jQuery document ready handlers.

### External Dependencies

- Bootstrap 4.3.1 (via CDN in ChrisCraft.html, local in index.html)
- Font Awesome 5.3.1
- jQuery 3.x with jQuery Migrate
- Slick Carousel
- Google Maps API (key: AIzaSyAtt1z99GtrHZt_IcnK-wryNsQ30A112J0)
- TechSmith Smart Player (SOE section)

### Color Scheme

Primary theme colors:
- Primary blue: `g-theme-bg-blue-dark-v1`, `g-theme-bg-blue-v1`
- Accent: `g-color-primary` (defined in template)
- Text: `g-color-gray-light-v2` on dark backgrounds

### Navigation

Scroll-based navigation uses `hs.scroll-nav.js` to:
- Highlight current section in navbar
- Smooth scroll to anchors (700ms duration)
- Change header appearance on scroll (controlled by `data-header-fix-moment="100"`)

## Content Structure

### Job Posting Section

The site includes a prominent PHP developer job posting for Project SQMSII (Syllabus & Question Management System II) for client ICO International Certification Organization. This section includes:
- Tech stack requirements (PHP, JavaScript, Go)
- Project links (PHP_CRUD_API, DeepL API, Hugo multilingual, OWASP)
- Ukrainian flag colors (#0057B8 blue, #FFD700 yellow)
- Partner training offerings

### Partner Information

Key partners displayed:
- ICO International Certification Organization (ico-cert.org)
- mITSM EDUCATION (mitsm.de)

### Legal/Impressum

Full German legal notice (Impressum) included per TMG requirements with company details for BPMspace GmbH.

## File Naming Convention

- Main pages: lowercase with underscores (e.g., `SOE_player.html`)
- Assets: kebab-case (e.g., `bootstrap.min.css`)
- Images: descriptive names, some UUIDs in gallery
- Special subdirectory: `3756635456442343545444325323` (appears to be a random identifier for private/semi-private gallery)
