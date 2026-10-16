"""Local dev server: same as `python3 -m http.server 8000`, but tells browsers not to cache,
so edits to CSS/JS/images always show up on reload. Run: python3 dev-server.py"""
import http.server, functools

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

http.server.ThreadingHTTPServer(('', 8000), functools.partial(NoCache, directory='.')).serve_forever()
