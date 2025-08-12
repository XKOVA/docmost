#!/bin/bash

# Development Docker Compose Helper Script
# This script ensures we always use the development configuration

case "$1" in
    "up")
        echo "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    "down")
        echo "Stopping development environment..."
        docker-compose -f docker-compose.dev.yml down
        ;;
    "build")
        echo "Building development environment..."
        docker-compose -f docker-compose.dev.yml up -d --build
        ;;
    "rebuild")
        echo "Rebuilding development environment from scratch..."
        docker-compose -f docker-compose.dev.yml down -v
        docker-compose -f docker-compose.dev.yml up -d --build
        ;;
    "logs")
        echo "Showing server logs..."
        docker-compose -f docker-compose.dev.yml logs server --tail=50 -f
        ;;
    "status")
        echo "Checking container status..."
        docker-compose -f docker-compose.dev.yml ps
        ;;
    *)
        echo "Usage: $0 {up|down|build|rebuild|logs|status}"
        echo ""
        echo "Commands:"
        echo "  up      - Start development containers"
        echo "  down    - Stop development containers"
        echo "  build   - Build and start development containers"
        echo "  rebuild - Completely rebuild from scratch (removes volumes)"
        echo "  logs    - Show and follow server logs"
        echo "  status  - Show container status"
        exit 1
        ;;
esac
