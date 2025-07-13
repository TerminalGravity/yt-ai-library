#!/bin/bash

echo "🚀 YouTube AI Library - Local Setup Script"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Creating .env file from template..."
    echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
    echo -e "${YELLOW}⚠️  Please edit .env file and add your OpenAI API key${NC}"
    exit 1
fi

# Check if OpenAI API key is set
source .env
if [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    echo -e "${RED}❌ Please set your OpenAI API key in .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration looks good${NC}"

# Run with Docker Compose
echo ""
echo "📦 Starting services with Docker Compose..."
echo ""

# Stop any existing containers
docker-compose down 2>/dev/null

# Start all services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
if docker-compose ps | grep -q "postgres.*healthy"; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
fi

echo ""
echo "🎉 YouTube AI Library is ready!"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f backend    # Backend logs"
echo "   docker-compose logs -f frontend   # Frontend logs"
echo "   docker-compose logs -f postgres   # Database logs"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""