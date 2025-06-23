import yt_dlp
import re
from typing import Dict, List, Optional
from datetime import datetime

class YouTubeService:
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
        }
    
    def extract_channel_id(self, url: str) -> str:
        """Extract channel ID from various YouTube URL formats"""
        patterns = [
            r'youtube\.com/channel/([a-zA-Z0-9_-]+)',
            r'youtube\.com/c/([a-zA-Z0-9_-]+)',
            r'youtube\.com/@([a-zA-Z0-9_-]+)',
            r'youtube\.com/user/([a-zA-Z0-9_-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        raise ValueError("Invalid YouTube channel URL")
    
    async def analyze_channel(self, url: str) -> Dict:
        """Analyze a YouTube channel and return basic information"""
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                # Get channel info
                info = ydl.extract_info(url, download=False)
                
                if not info:
                    raise ValueError("Could not extract channel information")
                
                # Extract channel data
                channel_data = {
                    "channel_id": info.get("id", ""),
                    "name": info.get("title", "Unknown Channel"),
                    "description": info.get("description", ""),
                    "thumbnail_url": self._get_best_thumbnail(info.get("thumbnails", [])),
                    "subscriber_count": info.get("subscriber_count"),
                    "video_count": info.get("playlist_count", 0),
                }
                
                return channel_data
                
        except Exception as e:
            raise Exception(f"Failed to analyze channel: {str(e)}")
    
    async def get_channel_videos(self, channel_id: str, max_videos: int = 100) -> List[Dict]:
        """Get list of videos from a channel"""
        try:
            channel_url = f"https://www.youtube.com/channel/{channel_id}/videos"
            
            opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,
                'playlistend': max_videos,
            }
            
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(channel_url, download=False)
                
                if not info or 'entries' not in info:
                    return []
                
                videos = []
                for entry in info['entries']:
                    if entry:
                        video_data = {
                            "video_id": entry.get("id", ""),
                            "title": entry.get("title", "Unknown Title"),
                            "description": entry.get("description", ""),
                            "thumbnail_url": self._get_best_thumbnail(entry.get("thumbnails", [])),
                            "duration": entry.get("duration"),
                            "view_count": entry.get("view_count"),
                            "published_at": self._parse_upload_date(entry.get("upload_date")),
                        }
                        videos.append(video_data)
                
                return videos
                
        except Exception as e:
            raise Exception(f"Failed to get channel videos: {str(e)}")
    
    async def get_video_transcript(self, video_id: str) -> Optional[str]:
        """Extract transcript from a YouTube video"""
        try:
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            opts = {
                'quiet': True,
                'no_warnings': True,
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': ['en'],
                'skip_download': True,
            }
            
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Try to get automatic subtitles first, then manual subtitles
                subtitles = info.get('automatic_captions', {}).get('en') or info.get('subtitles', {}).get('en')
                
                if not subtitles:
                    return None
                
                # Get the subtitle URL (prefer vtt format)
                subtitle_url = None
                for subtitle in subtitles:
                    if subtitle.get('ext') == 'vtt':
                        subtitle_url = subtitle.get('url')
                        break
                
                if not subtitle_url and subtitles:
                    subtitle_url = subtitles[0].get('url')
                
                if subtitle_url:
                    # Download and parse the subtitle content
                    import requests
                    response = requests.get(subtitle_url)
                    if response.status_code == 200:
                        return self._parse_vtt_content(response.text)
                
                return None
                
        except Exception as e:
            print(f"Failed to get transcript for video {video_id}: {str(e)}")
            return None
    
    def _get_best_thumbnail(self, thumbnails: List[Dict]) -> Optional[str]:
        """Get the best quality thumbnail URL"""
        if not thumbnails:
            return None
        
        # Sort by resolution (width * height) and return the highest
        sorted_thumbnails = sorted(
            thumbnails,
            key=lambda x: (x.get('width', 0) * x.get('height', 0)),
            reverse=True
        )
        
        return sorted_thumbnails[0].get('url') if sorted_thumbnails else None
    
    def _parse_upload_date(self, upload_date: str) -> Optional[datetime]:
        """Parse upload date string to datetime"""
        if not upload_date:
            return None
        
        try:
            return datetime.strptime(upload_date, '%Y%m%d')
        except:
            return None
    
    def _parse_vtt_content(self, vtt_content: str) -> str:
        """Parse VTT subtitle content and extract text"""
        lines = vtt_content.split('\n')
        text_lines = []
        
        for line in lines:
            line = line.strip()
            # Skip timestamp lines and empty lines
            if '-->' in line or not line or line.startswith('WEBVTT'):
                continue
            # Skip lines that look like timestamps
            if re.match(r'^\d{2}:\d{2}:\d{2}', line):
                continue
            
            # Clean up the text (remove HTML tags, etc.)
            clean_line = re.sub(r'<[^>]+>', '', line)
            if clean_line:
                text_lines.append(clean_line)
        
        return ' '.join(text_lines)