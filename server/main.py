import os
from flask import Blueprint, Flask
from routes.users_router import users_route_blueprint

app = Flask(__name__)
root_blueprint = Blueprint("API root", import_name=__name__, url_prefix="/api")

root_blueprint.register_blueprint(users_route_blueprint)
app.register_blueprint(root_blueprint)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
