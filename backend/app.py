from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from game import Game
import time


app = Flask(__name__)
app.config['SECRET_KEY'] = '.'
socketio = SocketIO(app, cors_allowed_origins="*")

game = None

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

@socketio.on("chat")
def chat(data):
    game.chat(data)


@socketio.on("start")
def start():
    global game
    game = Game("Kevin")

    print('starting')
    # emit('init', [p.serialize() for p in game.players])
    # socketio.sleep(1)


@socketio.on("startNight")
def start_night(detective_guess):
    assert game

    night = game.run_night(detective_guess)

    emit("newRound", {
        "round": game.day,
        "summary": night.summary,
        "players": [p.serialize() for p in night.players],
        "gameWon": game.is_game_won()
    })

    game.run_day(socketio)


if __name__ == '__main__':
    socketio.run(app, debug=True)

