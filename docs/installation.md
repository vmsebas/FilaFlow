# Installation

FilaFlow can be installed using Docker (recommended) or from source.

## Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- ~100MB disk space for the image
- Port 7912 available (or customize)

### Quick Install

1. Create a directory for FilaFlow:
```bash
mkdir filaflow && cd filaflow
```

2. Create `docker-compose.yml`:
```yaml
services:
  filaflow:
    image: ghcr.io/vmsebas/filaflow:latest
    container_name: filaflow
    restart: unless-stopped
    ports:
      - "7912:8000"
    volumes:
      - ./data:/home/app/.local/share/spoolman
    environment:
      - TZ=Europe/Lisbon  # Change to your timezone
```

3. Start the container:
```bash
docker compose up -d
```

4. Open http://localhost:7912 in your browser

### Custom Port

To use a different port, change the ports mapping:
```yaml
ports:
  - "8080:8000"  # Access via port 8080
```

### Data Persistence

All data is stored in `./data/`:
- `spoolman.db` - SQLite database
- `backups/` - Automatic backups

**Backup tip:** Regularly copy the `data/` folder to a safe location.

---

## From Source

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Steps

1. Clone the repository:
```bash
git clone https://github.com/vmsebas/FilaFlow.git
cd FilaFlow
```

2. Install Python dependencies:
```bash
pip install -e .
```

3. Build the client:
```bash
cd client
npm install
npm run build
cd ..
```

4. Run the server:
```bash
uvicorn spoolman.main:app --host 0.0.0.0 --port 8000
```

---

## Updating

### Docker
```bash
docker compose pull
docker compose up -d
```

### From Source
```bash
git pull
cd client && npm install && npm run build
```

---

## Next Steps

- [Quick Start Guide](quickstart.md) - Get up and running
- [Configuration](configuration.md) - Customize your installation
