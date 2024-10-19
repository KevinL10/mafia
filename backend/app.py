from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = '.'
socketio = SocketIO(app, cors_allowed_origins="*")

games = {}

@app.route('/')
def index():
    return jsonify({"status": "ok"})

@socketio.on('connect')
def handle_connect():
    print('Client connected:', request.sid)
    emit('message', {'msg': 'Connected to the server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)

@socketio.on("ping")
def ping(data):
    print('pinged')
    emit('pong', {'msg': 'pong'})


if __name__ == '__main__':
    socketio.run(app, debug=True)