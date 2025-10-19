# BPMspace Website

GitHub Pages website for BPMspace GmbH - Agile Business Process Management consulting.

## Project Structure

```
/
├── www/                    # Public website files (deployed to GitHub Pages)
│   ├── index.html         # Main landing page
│   ├── ai-on-boat/        # AI on Boat landing page
│   ├── assets/            # CSS, JS, images
│   ├── SOE/               # SecureOnlineExam demo
│   └── .nojekyll          # Disable Jekyll processing
├── dev/                   # Development tools
│   └── preview.sh         # Local preview script
├── scripts/               # Build and automation scripts
├── infra/                 # Infrastructure configs
├── docker-compose.yml     # Caddy-based local preview
└── .github/workflows/     # GitHub Actions
```

## Local Preview

Run a local preview server using Docker:

```bash
# Using Docker Compose (recommended - includes Caddy labels)
docker-compose up

# Or using the script (nginx-based)
./dev/preview.sh

# Or specify custom port
PORT=3000 ./dev/preview.sh
```

Then open http://localhost:8080 in your browser.

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `master` branch.

**Only the `/www` directory is published** - development files, scripts, and configs remain in the repository but are not deployed.

### GitHub Pages Setup

Ensure GitHub Pages is configured to use **GitHub Actions** as the source:
1. Go to repository Settings → Pages
2. Under "Build and deployment", select **Source: GitHub Actions**

## Development

### Adding Content

- Edit files in `/www` directory
- Main page: `/www/index.html`
- New pages: add to `/www/` subdirectories

### Photo Gallery

To regenerate the ChrisCraft photo gallery after adding images:

```bash
cd www/3756635456442343545444325323
docker run -v $(pwd):/app/ php:8.0-cli php /app/createhtml.php > ChrisCraft.html
```

## Features

- **AI on Boat**: Open-source boat automation platform landing page
- **BPM Services**: Core business process management offerings
- **SecureOnlineExam**: AI-powered proctoring demo
- **Partners**: ICO and mITSM partnerships

## Tech Stack

- Static HTML/CSS/JS
- Bootstrap 4.3.1
- Unify template framework
- GitHub Actions for CI/CD
- Caddy (local preview)
