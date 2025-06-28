#!/usr/bin/env python3
"""
Simple development server with proper MIME types for React/TypeScript files
"""
import http.server
import socketserver
import mimetypes
import os

# Add custom MIME types for TypeScript and JSX files
mimetypes.add_type('application/javascript', '.tsx')
mimetypes.add_type('application/javascript', '.ts')
mimetypes.add_type('application/javascript', '.jsx')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/json', '.json')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def guess_type(self, path):
        """Override to handle TypeScript and JSX files properly"""
        # Force JavaScript MIME type for TypeScript and JSX files
        if path.endswith(('.tsx', '.ts', '.jsx')):
            return 'application/javascript', None
        elif path.endswith('.json'):
            return 'application/json', None
        else:
            # Use the parent method for other files
            return super().guess_type(path)

if __name__ == "__main__":
    PORT = 8888
    
    # Change to the directory containing the files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Development server running at http://localhost:{PORT}")
        print("📱 Open this URL in Chrome or Edge for full device integration support")
        print("🔧 Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            httpd.shutdown()
