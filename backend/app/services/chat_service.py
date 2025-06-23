from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import text
from openai import OpenAI
import os

from app.models import VideoEmbedding, Video
from app import schemas

class ChatService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("OPENAI_MODEL", "o3-mini")
    
    async def chat_with_context(self, message: str, channel_id: int, db: Session) -> schemas.ChatResponse:
        """Chat with AI using channel content as context"""
        try:
            # Get relevant context from embeddings
            context_chunks = await self.get_relevant_context(message, channel_id, db)
            
            # Build context string
            context = "\n".join([chunk["content"] for chunk in context_chunks])
            
            # Create system prompt
            system_prompt = f"""You are an AI assistant helping users understand and learn from YouTube videos. 
            Use the following transcript content as context to answer the user's question:

            CONTEXT:
            {context}

            Instructions:
            - Answer based on the provided context
            - If the context doesn't contain relevant information, say so
            - Be helpful and educational
            - Reference specific video content when possible
            - Provide timestamps when available
            """
            
            # Get AI response
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            ai_response = response.choices[0].message.content
            
            # Format sources
            sources = [
                {
                    "video_title": chunk["video_title"],
                    "video_url": chunk["video_url"],
                    "timestamp_start": chunk["timestamp_start"],
                    "timestamp_end": chunk["timestamp_end"],
                    "content_preview": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"]
                }
                for chunk in context_chunks
            ]
            
            return schemas.ChatResponse(
                response=ai_response,
                sources=sources
            )
            
        except Exception as e:
            raise Exception(f"Chat failed: {str(e)}")
    
    async def get_relevant_context(self, query: str, channel_id: int, db: Session, limit: int = 5) -> List[Dict]:
        """Get relevant context chunks using semantic similarity"""
        try:
            # Create embedding for the query
            query_embedding = await self.get_embedding(query)
            
            # Search for similar content using pgvector
            results = db.execute(
                text("""
                    SELECT ve.content, ve.timestamp_start, ve.timestamp_end, 
                           v.title, v.url, ve.embedding <=> :query_embedding as distance
                    FROM video_embeddings ve
                    JOIN videos v ON ve.video_id = v.id
                    WHERE v.channel_id = :channel_id
                    ORDER BY distance
                    LIMIT :limit
                """),
                {
                    "query_embedding": query_embedding,
                    "channel_id": channel_id,
                    "limit": limit
                }
            ).fetchall()
            
            return [
                {
                    "content": row.content,
                    "timestamp_start": row.timestamp_start,
                    "timestamp_end": row.timestamp_end,
                    "video_title": row.title,
                    "video_url": row.url,
                    "similarity_score": 1 - row.distance
                }
                for row in results
            ]
            
        except Exception as e:
            print(f"Error getting relevant context: {str(e)}")
            return []
    
    async def get_embedding(self, text: str) -> List[float]:
        """Create embedding for text"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
                encoding_format="float"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error creating embedding: {str(e)}")
            raise
    
    async def generate_study_guide(self, channel_id: int, topic: str, db: Session) -> str:
        """Generate a study guide for a specific topic from channel content"""
        try:
            # Get relevant context for the topic
            context_chunks = await self.get_relevant_context(topic, channel_id, db, limit=10)
            
            if not context_chunks:
                return "No relevant content found for this topic."
            
            # Build context string
            context = "\n".join([f"- {chunk['content']}" for chunk in context_chunks])
            
            # Create study guide prompt
            prompt = f"""Create a comprehensive study guide for the topic "{topic}" based on the following video content:

            CONTENT:
            {context}

            Please create a structured study guide that includes:
            1. Key concepts and definitions
            2. Important points and takeaways
            3. Examples or case studies mentioned
            4. Questions for further reflection
            5. Summary of main ideas

            Make it educational and well-organized."""
            
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Study guide generation failed: {str(e)}")
    
    async def generate_summary(self, channel_id: int, db: Session) -> str:
        """Generate a summary of all content in a channel"""
        try:
            # Get a sample of content from the channel
            results = db.execute(
                text("""
                    SELECT ve.content, v.title 
                    FROM video_embeddings ve
                    JOIN videos v ON ve.video_id = v.id
                    WHERE v.channel_id = :channel_id
                    ORDER BY ve.id
                    LIMIT 20
                """),
                {"channel_id": channel_id}
            ).fetchall()
            
            if not results:
                return "No content available to summarize."
            
            content = "\n".join([f"From '{row.title}': {row.content}" for row in results])
            
            prompt = f"""Analyze the following content from various videos and create a comprehensive summary:

            CONTENT:
            {content}

            Please provide:
            1. Main themes and topics covered
            2. Key insights and learnings
            3. Overall content focus and style
            4. Value proposition for learners

            Keep it concise but informative."""
            
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Summary generation failed: {str(e)}")