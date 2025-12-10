#!/bin/bash
# DGX Spark Deployment Script for KaivilleMap
# Usage: ./scripts/deploy-dgx.sh [command]
# Commands: build, start, stop, restart, logs, status

set -e

COMPOSE_FILE="docker-compose.dgx.yml"
CONTAINER_NAME="kaivillemap"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_env_file() {
    if [ ! -f ".env" ]; then
        log_error ".env file not found!"
        log_info "Creating from template..."
        cat > .env << 'ENVEOF'
# KaivilleMap Environment Variables for DGX Spark
NODE_ENV=production
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id

# Build-time variables for Vite (client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ENVEOF
        log_warn "Please edit .env file with your actual credentials, then run this script again."
        exit 1
    fi
}

build() {
    log_info "Building KaivilleMap Docker image..."
    check_env_file
    
    # Export env vars for build-time access
    export $(grep -v '^#' .env | xargs)
    
    docker compose -f $COMPOSE_FILE build --no-cache
    log_info "Build complete!"
}

start() {
    log_info "Starting KaivilleMap..."
    check_env_file
    docker compose -f $COMPOSE_FILE up -d
    log_info "KaivilleMap started!"
    log_info "Access the app at: http://$(hostname -I | awk '{print $1}'):3001"
    log_info "Or via localhost: http://localhost:3001"
}

stop() {
    log_info "Stopping KaivilleMap..."
    docker compose -f $COMPOSE_FILE down
    log_info "KaivilleMap stopped."
}

restart() {
    log_info "Restarting KaivilleMap..."
    stop
    start
}

logs() {
    log_info "Showing logs (Ctrl+C to exit)..."
    docker compose -f $COMPOSE_FILE logs -f
}

status() {
    log_info "Container status:"
    docker compose -f $COMPOSE_FILE ps
    echo ""
    log_info "Health check:"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "unknown")
        echo "  Health: $HEALTH"
        
        # Try to hit the health endpoint
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            log_info "API is responding!"
            curl -s http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/api/health
        else
            log_warn "API not responding yet..."
        fi
    else
        log_warn "Container is not running."
    fi
}

shell() {
    log_info "Opening shell in container..."
    docker exec -it $CONTAINER_NAME /bin/sh
}

# Main
case "${1:-help}" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    shell)
        shell
        ;;
    deploy)
        build
        start
        sleep 5
        status
        ;;
    help|*)
        echo "KaivilleMap DGX Spark Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build    - Build the Docker image"
        echo "  start    - Start the container"
        echo "  stop     - Stop the container"
        echo "  restart  - Restart the container"
        echo "  logs     - View container logs"
        echo "  status   - Check container status"
        echo "  shell    - Open shell in container"
        echo "  deploy   - Build and start (full deployment)"
        echo "  help     - Show this help message"
        ;;
esac
