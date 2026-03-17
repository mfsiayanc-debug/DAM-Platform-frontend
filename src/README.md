# Digital Asset Management (DAM) Platform

A complete Digital Asset Management solution with React frontend and Node.js backend, featuring background processing, video transcoding, and scalable storage.

## 🎯 Features

### Frontend

- **Modern React UI** with Tailwind CSS
- **Dashboard** with real-time analytics
- **Asset Gallery** with search, filters, and sorting
- **Drag & Drop Upload** with progress tracking
- **Asset Preview** with detailed metadata
- **Responsive Design** for all screen sizes

### Backend

- **RESTful API** with Express.js
- **Background Processing** with BullMQ workers
- **Object Storage** with MinIO (S3-compatible)
- **PostgreSQL Database** for metadata
- **Image Processing** with Sharp (thumbnail generation)
- **Video Transcoding** with FFmpeg
- **Auto-tagging** based on filename and MIME type
- **Horizontal Scaling** with Docker Swarm

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### 1. Start Backend Services

```bash
cd backend
cp .env.example .env
docker-compose up -d
```

Wait ~30 seconds for services to initialize.

### 2. Start Frontend

```bash
# In root directory
npm install
cp .env.example .env.local
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **BullMQ Dashboard**: http://localhost:3002

## 📁 Project Structure

```
dam-platform/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── db/                # Database layer
│   │   ├── config/            # Configuration
│   │   ├── server.js          # API server
│   │   └── worker.js          # Background worker
│   ├── scripts/               # Deployment scripts
│   ├── k8s/                   # Kubernetes configs
│   ├── Dockerfile             # API container
│   ├── Dockerfile.worker      # Worker container
│   ├── docker-compose.yml     # Development setup
│   └── docker-compose.swarm.yml  # Production setup
├── components/                # React components
├── services/                  # API integration
├── data/                      # Mock data
├── types.ts                   # TypeScript types
├── App.tsx                    # Main app component
└── DEPLOYMENT.md             # Deployment guide
```

## 🛠 Technology Stack

### Frontend

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **BullMQ** - Job queue
- **Sharp** - Image processing
- **FFmpeg** - Video processing
- **PostgreSQL** - Database
- **Redis** - Queue & cache
- **MinIO** - Object storage

### DevOps

- **Docker** - Containerization
- **Docker Swarm** - Orchestration
- **Kubernetes** - Production orchestration (optional)
- **Nginx** - Reverse proxy

## 📚 Documentation

- [**Deployment Guide**](DEPLOYMENT.md) - Complete deployment instructions
- [**Backend README**](backend/README.md) - Backend API documentation
- [**API Reference**](#api-endpoints) - API endpoints and usage

## 🔌 API Endpoints

### Assets

- `POST /api/assets/upload` - Upload files (multipart/form-data)
- `GET /api/assets` - Get all assets with filters
- `GET /api/assets/:id` - Get asset by ID
- `GET /api/assets/:id/download` - Download asset
- `DELETE /api/assets/:id` - Delete asset
- `PATCH /api/assets/:id/tags` - Update tags

### Stats

- `GET /api/stats` - Get dashboard statistics

### Query Parameters (GET /api/assets)

- `type` - Filter by type (image, video, document, all)
- `search` - Search by name or tags
- `sortBy` - Sort field (uploaded_at, name, downloads)
- `order` - Sort order (ASC, DESC)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

## 🔧 Development

### Run Frontend Only (Mock Data)

```bash
npm install
npm run dev
```

### Run Backend Only

```bash
cd backend
npm install
cp .env.example .env

# Start infrastructure
docker-compose up -d postgres redis minio

# Start API
npm run dev

# Start worker (new terminal)
npm run worker
```

### Run Full Stack

```bash
# Terminal 1: Backend
cd backend
docker-compose up -d

# Terminal 2: Frontend
npm run dev
```

## 🚢 Production Deployment

### Docker Swarm

```bash
cd backend

# Initialize swarm
docker swarm init

# Build images
docker build -t registry.example.com/dam-api:latest .
docker build -t registry.example.com/dam-worker:latest -f Dockerfile.worker .

# Push to registry
docker push registry.example.com/dam-api:latest
docker push registry.example.com/dam-worker:latest

# Deploy
docker stack deploy -c docker-compose.swarm.yml dam

# Scale workers
docker service scale dam_worker=5
```

### Kubernetes

```bash
cd backend/k8s

# Create secrets
kubectl create secret generic dam-secrets \
  --from-literal=database-url='postgresql://...'

# Deploy
kubectl apply -f deployment.yaml
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

### Queue Status

```bash
docker exec dam-redis redis-cli LLEN bull:asset-processing:wait
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f worker
```

### BullMQ Dashboard

Access at http://localhost:3002 for queue monitoring.

## 🔐 Security

Before deploying to production:

1. ✅ Change default passwords in `.env`
2. ✅ Use HTTPS/SSL (Let's Encrypt)
3. ✅ Implement authentication (JWT/OAuth)
4. ✅ Enable rate limiting (included)
5. ✅ Validate file uploads strictly
6. ✅ Use environment variables for secrets
7. ✅ Regular security updates

## 📈 Scaling

### Horizontal Scaling

**Scale API:**

```bash
docker service scale dam_api=4
```

**Scale Workers:**

```bash
docker service scale dam_worker=10
```

**Auto-scaling** is available with Kubernetes HPA (see k8s/deployment.yaml).

### Performance Tips

1. Increase worker concurrency based on CPU cores
2. Use Redis cluster for HA
3. Enable MinIO distributed mode
4. Add CDN for asset delivery
5. Implement caching layer
6. Database connection pooling (included)

## 🗄 Backup & Restore

### Backup

```bash
cd backend
./scripts/backup.sh
```

### Restore

```bash
tar -xzf backups/dam_backup_*.tar.gz
# Follow restore instructions in DEPLOYMENT.md
```

## 🐛 Troubleshooting

### API not responding

```bash
docker-compose ps
docker-compose logs api
```

### Workers not processing

```bash
docker-compose logs worker
docker-compose restart worker
```

### Upload fails

```bash
# Check MinIO
curl http://localhost:9000/minio/health/live

# Check disk space
df -h
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting tips.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check [DEPLOYMENT.md](DEPLOYMENT.md)
2. Review [backend/README.md](backend/README.md)
3. Check logs: `docker-compose logs`
4. Open an issue on GitHub

## 🎉 What's Next?

- [ ] Add user authentication
- [ ] Implement folder organization
- [ ] Add sharing & permissions
- [ ] CDN integration
- [ ] Advanced search (AI-powered)
- [ ] Batch operations
- [ ] API rate limiting per user
- [ ] Webhooks for events
- [ ] Mobile app

---

Built with ❤️ using React, Node.js, BullMQ, and MinIO
