from flask import Flask, send_from_directory, make_response, request, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
import os
import mimetypes

from routes.contacts import contacts_bp
from routes.campaigns import campaigns_bp
from routes.templates import templates_bp
from routes.webhook import webhook
from routes.analytics import analytics_bp
from routes.calls import calls_bp
from flask_cors import CORS


def create_app():
    app = Flask(__name__, 
                static_folder="../frontend/dist", 
                static_url_path="/")
    app.config.from_object(Config)
    # CORS(app)
    CORS(app, origins="*")  # or specify your frontend URL

    # ✅ ENSURE DIRECTORIES EXIST
    os.makedirs("static/posters", exist_ok=True)

    # ✅ INIT DB WITH APP
    db.init_app(app)

    # ✅ REGISTER ROUTES
    app.register_blueprint(contacts_bp)
    app.register_blueprint(campaigns_bp)
    app.register_blueprint(templates_bp)
    app.register_blueprint(webhook)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(calls_bp)


    @app.before_request
    def log_everything():
        if request.path == "/webhook/whatsapp":
            print(f"DEBUG ALERT: Request hitting {request.path} [{request.method}]")
            if request.method == "POST":
                print(f"DEBUG BODY: {request.get_data(as_text=True)}")

    # ✅ BYPASS NGROK INTERIM PAGE (Global)
    @app.after_request
    def add_ngrok_skip_header(response):
        response.headers["ngrok-skip-browser-warning"] = "true"
        return response

    # ✅ PRIVACY POLICY
    @app.route("/privacy")
    def privacy():
        return "<h1>Privacy Policy</h1><p>Obsidyne Bot does not share your data.</p>"

    # ✅ EXPLICIT ROUTE FOR POSTERS
    @app.route("/static/posters/<path:filename>")
    def serve_poster(filename):
        response = make_response(send_from_directory("static/posters", filename))
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type:
            response.headers["Content-Type"] = mime_type
        return response

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith('/api/'):
            return jsonify(error="Not found"), 404
        return app.send_static_file("index.html")

    # ✅ CREATE TABLES
    with app.app_context():
        db.create_all()

    # ✅ START SCHEDULER
    from services.scheduler import start_scheduler
    start_scheduler(app)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)