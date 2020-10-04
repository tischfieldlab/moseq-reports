import sys
from flask import Flask
from flask_graphql import GraphQLView

from models import db_session
from schema import schema

import argparse

app = Flask(__name__)

# expose GraphQL schema
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True # GraphiQL interfaces
    )
)

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route("/")
def hello():
    return "Hello, World!"

if __name__ == '__main__':
    app.run()

# def main():
#     parser = argparse.ArgumentParser()

#     # Port number to run backend
#     parser.add_argument("-p", "--port", default="8000", type=str)

#     # Address to run on
#     parser.add_argument("-a", "--address", default="localhost", type=str)

#     args = parser.parse_args()

#     full_address = "http://" + args.address + ":" + args.port

#     print(full_address)

#     # Bootstrap the app, then we are good
#     app.run(host=args.address, port=args.port)


# if __name__ == "__main__":
#     main()


# app = Flask(__name__)


# @app.route("/")
# def hello():
#     return "Hello, World!"


# if __name__ == '__main__':
#     app.run(host='127.0.0.1', port=5000)
