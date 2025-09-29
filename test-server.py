# test-server.py
import http.server
import socketserver
import os
import sys
from urllib.parse import unquote

PORT = 4000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Decode URL
        path = unquote(self.path)
        if path.endswith('/'):
            path = path + "index.html"
        elif not os.path.splitext(path)[1]:
            # If no extension, try .html
            path_try = path + ".html"
            if os.path.exists(self.translate_path(path_try)):
                path = path_try
        
        self.path = path
        return super().do_GET()

def run():
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        print(f"Serving HTTP on port {PORT} (http://localhost:{PORT}/) ...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down")
            httpd.server_close()
            sys.exit(0)

if __name__ == "__main__":
    run()
