from models.user import User
from flask import jsonify, Blueprint

users_route_blueprint = Blueprint("users", __name__, url_prefix="/user")


@users_route_blueprint.route("/")
def list_users():
    list_of_users = [User("696969", "sru3"), User("3439032", "apeng6")]

    return jsonify(list_of_users)
