# Development Guide

Comprehensive guide for developers working on the YouTube AI Library project.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Database Management](#database-management)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Adding New Features](#adding-new-features)
- [Performance Considerations](#performance-considerations)
- [Debugging](#debugging)

## Development Environment Setup

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Docker and Docker Compose
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd yt-ai-library
```

2. **Set up Python environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
```

3. **Set up Node.js environment:**
```bash
cd frontend
npm install
```

4. **Set up environment variables:**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd frontend
cp .env.example .env.local
# Edit with your local configuration
```

5. **Start the database:**
```bash
docker-compose up -d postgres
```

6. **Run database migrations:**
```bash
cd backend
alembic upgrade head
```

### Development Dependencies

**Backend (`requirements-dev.txt`):**
```
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
black==23.11.0
flake8==6.1.0
mypy==1.7.1
pre-commit==3.6.0
sqlalchemy-stubs==0.4
```

**Frontend:**
Development dependencies are included in `package.json`.

### VS Code Configuration

Create `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.linting.mypyEnabled": true,
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.workingDirectories": ["frontend"]
}
```

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/main.py",
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

## Project Architecture

### Backend Architecture

```
backend/
├── app/
│   ├── api/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── channels.py      # Channel management endpoints
│   │   ├── videos.py        # Video management endpoints
│   │   └── chat.py          # Chat and search endpoints
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   ├── channel.py       # Channel model
│   │   ├── video.py         # Video model
│   │   └── embedding.py     # Embedding model
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── youtube_service.py    # YouTube API integration
│   │   ├── ingestion_service.py  # Video ingestion logic
│   │   └── chat_service.py       # AI chat functionality
│   ├── workflows/           # LangGraph workflows (future)
│   ├── database.py          # Database configuration
│   └── schemas.py           # Pydantic models
├── tests/                   # Test files
├── alembic/                 # Database migrations
├── requirements.txt
├── requirements-dev.txt
└── main.py                  # Application entry point
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ChannelInputModal.tsx
│   │   ├── ChannelAnalysisStep.tsx
│   │   ├── VideoSelectionStep.tsx
│   │   ├── IngestionProgressStep.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── SearchInterface.tsx
│   │   ├── VideosInterface.tsx
│   │   └── Sidebar.tsx
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   └── ChannelLibraryPage.tsx
│   ├── contexts/            # React contexts
│   │   └── ChannelContext.tsx
│   ├── services/            # API client
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
└── tailwind.config.js
```

## Coding Standards

### Python Standards

1. **PEP 8 Compliance:**
   - Use Black for code formatting
   - Maximum line length: 88 characters
   - Use type hints for all functions

2. **Naming Conventions:**
   - Functions and variables: `snake_case`
   - Classes: `PascalCase`
   - Constants: `UPPER_SNAKE_CASE`

3. **Documentation:**
   - Docstrings for all public functions and classes
   - Use Google-style docstrings

Example:
```python
from typing import List, Optional
from sqlalchemy.orm import Session


async def get_channel_videos(
    channel_id: str, 
    db: Session, 
    limit: Optional[int] = None
) -> List[VideoAnalysis]:
    """
    Retrieve videos for a specific YouTube channel.
    
    Args:
        channel_id: YouTube channel ID
        db: Database session
        limit: Maximum number of videos to return
        
    Returns:
        List of VideoAnalysis objects
        
    Raises:
        ValueError: If channel_id is invalid
        HTTPException: If channel is not found
    """
    # Implementation here
    pass
```

### TypeScript Standards

1. **Naming Conventions:**
   - Variables and functions: `camelCase`
   - Components and types: `PascalCase`
   - Constants: `UPPER_SNAKE_CASE`

2. **Type Safety:**
   - Use strict TypeScript configuration
   - Define interfaces for all data structures
   - Avoid `any` type

3. **Component Structure:**
```typescript
import React, { useState, useEffect } from 'react';

interface ComponentProps {
  title: string;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

const ComponentName: React.FC<ComponentProps> = ({ 
  title, 
  onAction, 
  isLoading = false 
}) => {
  const [localState, setLocalState] = useState<string>('');

  useEffect(() => {
    // Effect logic
  }, []);

  const handleClick = (id: string) => {
    onAction(id);
  };

  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### Git Commit Standards

Use conventional commits format:
```
type(scope): description

feat(api): add video search endpoint
fix(ui): resolve modal closing issue
docs(readme): update installation instructions
refactor(services): optimize embedding generation
test(api): add tests for channel endpoints
```

## Development Workflow

### Feature Development

1. **Create feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make changes and commit:**
```bash
git add .
git commit -m "feat(scope): description"
```

3. **Run tests and linting:**
```bash
# Backend
cd backend
python -m pytest
black .
flake8 .
mypy .

# Frontend
cd frontend
npm test
npm run lint
npm run type-check
```

4. **Push and create pull request:**
```bash
git push origin feature/your-feature-name
```

### Code Review Process

1. **Before submitting PR:**
   - All tests pass
   - Code is properly formatted
   - Documentation is updated
   - No linting errors

2. **PR Requirements:**
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Test coverage maintained

3. **Review checklist:**
   - Code follows standards
   - Tests are comprehensive
   - Security considerations addressed
   - Performance implications considered

## Testing

### Backend Testing

1. **Test Structure:**
```
backend/tests/
├── conftest.py              # Test configuration
├── test_api/
│   ├── test_channels.py     # Channel API tests
│   ├── test_videos.py       # Video API tests
│   └── test_chat.py         # Chat API tests
├── test_services/
│   ├── test_youtube_service.py
│   ├── test_ingestion_service.py
│   └── test_chat_service.py
└── test_models/
    ├── test_channel.py
    ├── test_video.py
    └── test_embedding.py
```

2. **Test Configuration (`conftest.py`):**
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db():
    return TestingSessionLocal()
```

3. **Example Test:**
```python
def test_create_channel(client, db):
    """Test channel creation endpoint."""
    channel_data = {
        "name": "Test Channel",
        "url": "https://youtube.com/@test"
    }
    
    response = client.post("/api/channels/", json=channel_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Channel"
    assert "id" in data
```

4. **Running Tests:**
```bash
cd backend
python -m pytest                    # Run all tests
python -m pytest tests/test_api/    # Run API tests only
python -m pytest -v                 # Verbose output
python -m pytest --cov=app          # With coverage
```

### Frontend Testing

1. **Test Structure:**
```
frontend/src/
├── components/
│   ├── __tests__/
│   │   ├── ChannelInputModal.test.tsx
│   │   ├── ChatInterface.test.tsx
│   │   └── SearchInterface.test.tsx
├── services/
│   └── __tests__/
│       └── api.test.ts
└── utils/
    └── __tests__/
        └── helpers.test.ts
```

2. **Example Component Test:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChannelInputModal from '../ChannelInputModal';

describe('ChannelInputModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onChannelCreated: jest.fn(),
  };

  test('renders modal when open', () => {
    render(<ChannelInputModal {...mockProps} />);
    
    expect(screen.getByText('Add New Channel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/youtube channel url/i)).toBeInTheDocument();
  });

  test('calls onClose when cancel button clicked', () => {
    render(<ChannelInputModal {...mockProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });
});
```

3. **Running Tests:**
```bash
cd frontend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
```

## Database Management

### Migrations

1. **Create Migration:**
```bash
cd backend
alembic revision --autogenerate -m "Add new column to videos table"
```

2. **Apply Migrations:**
```bash
alembic upgrade head        # Apply all pending migrations
alembic upgrade +1          # Apply one migration
alembic downgrade -1        # Rollback one migration
```

3. **Migration File Example:**
```python
"""Add transcript column to videos

Revision ID: abc123
Revises: def456
Create Date: 2024-01-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'abc123'
down_revision = 'def456'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('videos', sa.Column('transcript', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('videos', 'transcript')
```

### Database Seeding

Create `backend/seed_data.py`:
```python
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Channel, Video

def seed_database():
    db = SessionLocal()
    
    # Create sample channels
    channel = Channel(
        channel_id="UC123456789",
        name="Sample Channel",
        description="A sample channel for testing",
        url="https://youtube.com/@sample"
    )
    db.add(channel)
    db.commit()
    
    print("Database seeded successfully")
    db.close()

if __name__ == "__main__":
    seed_database()
```

## API Development

### Adding New Endpoints

1. **Define Pydantic Schema:**
```python
# app/schemas.py
class StudyGuideRequest(BaseModel):
    topic: str
    channel_id: int
    include_timestamps: bool = True

class StudyGuideResponse(BaseModel):
    content: str
    sources: List[dict]
```

2. **Create API Endpoint:**
```python
# app/api/study.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import StudyGuideRequest, StudyGuideResponse

router = APIRouter()

@router.post("/generate", response_model=StudyGuideResponse)
async def generate_study_guide(
    request: StudyGuideRequest,
    db: Session = Depends(get_db)
):
    """Generate a study guide for a specific topic."""
    # Implementation here
    pass
```

3. **Add Router to Main App:**
```python
# main.py
from app.api import study

app.include_router(study.router, prefix="/api/study", tags=["study"])
```

### Error Handling

```python
from fastapi import HTTPException, status

class ChannelNotFoundError(HTTPException):
    def __init__(self, channel_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Channel with id {channel_id} not found"
        )

class ValidationError(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message
        )
```

## Frontend Development

### State Management

1. **Context Pattern:**
```typescript
// contexts/StudyContext.tsx
interface StudyContextType {
  studyGuides: StudyGuide[];
  createStudyGuide: (request: StudyGuideRequest) => Promise<StudyGuide>;
  loading: boolean;
  error: string | null;
}

export const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return context;
};
```

2. **Custom Hooks:**
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(apiCall: () => Promise<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
```

### Component Development

1. **Component Guidelines:**
   - Single responsibility principle
   - Proper prop typing
   - Error boundaries
   - Loading states
   - Accessibility features

2. **Example Component:**
```typescript
interface StudyGuideCardProps {
  studyGuide: StudyGuide;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const StudyGuideCard: React.FC<StudyGuideCardProps> = ({
  studyGuide,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="card" role="article" aria-labelledby={`study-${studyGuide.id}`}>
      <h3 id={`study-${studyGuide.id}`} className="text-lg font-semibold">
        {studyGuide.topic}
      </h3>
      <p className="text-gray-600 mt-2">{studyGuide.summary}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(studyGuide.id)}
          className="btn-secondary"
          aria-label={`Edit study guide for ${studyGuide.topic}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(studyGuide.id)}
          className="btn-danger"
          aria-label={`Delete study guide for ${studyGuide.topic}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
```

## Adding New Features

### Feature Development Checklist

1. **Planning:**
   - [ ] Define requirements and scope
   - [ ] Design database schema changes
   - [ ] Plan API endpoints
   - [ ] Design UI/UX mockups

2. **Backend Implementation:**
   - [ ] Create/update database models
   - [ ] Generate and apply migrations
   - [ ] Implement business logic in services
   - [ ] Create API endpoints
   - [ ] Write comprehensive tests
   - [ ] Update API documentation

3. **Frontend Implementation:**
   - [ ] Create/update TypeScript interfaces
   - [ ] Implement UI components
   - [ ] Add API integration
   - [ ] Implement state management
   - [ ] Add error handling
   - [ ] Write component tests

4. **Integration and Testing:**
   - [ ] End-to-end testing
   - [ ] Performance testing
   - [ ] Security review
   - [ ] Documentation updates

### Example: Adding Study Guide Feature

1. **Database Model:**
```python
# app/models/study_guide.py
class StudyGuide(Base):
    __tablename__ = "study_guides"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    channel = relationship("Channel", back_populates="study_guides")
```

2. **Service Implementation:**
```python
# app/services/study_service.py
class StudyService:
    async def generate_study_guide(
        self, 
        topic: str, 
        channel_id: int, 
        db: Session
    ) -> StudyGuide:
        # Get relevant content
        context = await self.get_relevant_context(topic, channel_id, db)
        
        # Generate study guide using AI
        content = await self.ai_generate_study_guide(topic, context)
        
        # Save to database
        study_guide = StudyGuide(
            title=f"Study Guide: {topic}",
            topic=topic,
            content=content,
            channel_id=channel_id
        )
        db.add(study_guide)
        db.commit()
        
        return study_guide
```

## Performance Considerations

### Backend Performance

1. **Database Optimization:**
   - Use appropriate indexes
   - Implement query optimization
   - Use connection pooling
   - Consider read replicas for scaling

2. **API Optimization:**
   - Implement pagination
   - Use async/await for I/O operations
   - Add caching layers
   - Optimize serialization

3. **Memory Management:**
   - Monitor embedding storage
   - Implement cleanup procedures
   - Use streaming for large datasets

### Frontend Performance

1. **React Optimization:**
   - Use React.memo for expensive components
   - Implement proper key props for lists
   - Lazy load components and routes
   - Optimize re-renders with useMemo/useCallback

2. **Bundle Optimization:**
   - Code splitting
   - Tree shaking
   - Minimize bundle size
   - Use CDN for static assets

## Debugging

### Backend Debugging

1. **Logging:**
```python
import logging

logger = logging.getLogger(__name__)

async def problematic_function():
    logger.info("Starting function execution")
    try:
        # Function logic
        logger.debug("Processing data: %s", data)
    except Exception as e:
        logger.error("Error occurred: %s", str(e), exc_info=True)
        raise
```

2. **Database Debugging:**
```python
# Enable SQL logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Debug queries
from sqlalchemy import text
result = db.execute(text("EXPLAIN ANALYZE SELECT * FROM videos WHERE channel_id = :id"), {"id": 1})
print(result.fetchall())
```

### Frontend Debugging

1. **React Developer Tools:**
   - Install browser extension
   - Profile component performance
   - Inspect component state

2. **Console Debugging:**
```typescript
// Add debugging information
console.group('API Call Debug');
console.log('Request:', requestData);
console.log('Response:', responseData);
console.groupEnd();

// Use debugger statement
const handleSubmit = (data: FormData) => {
  debugger; // Execution will pause here
  processFormData(data);
};
```

3. **Error Boundaries:**
```typescript
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

---

This development guide provides a comprehensive foundation for contributing to the YouTube AI Library project. Keep it updated as the project evolves and new patterns emerge.