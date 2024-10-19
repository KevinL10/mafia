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

@socketio.on("startGame")
def start_game(name):
    global game
    # if game is not None:
    #     emit('error', {'msg': "game is already in progress.. something went wrong"})
        # return
    

    print('starting game')
    game = Game(name or "kevin")

    night = game.run_night(-1)
    
    emit('newRound', {
        "round": game.day,
        # "mafiaEliminated": night.mafia_eliminated,
        # "detectiveEliminated": night.detective_eliminated,
        # "doctorSaved": night.doctor_saved,
        # "summary": night.summary,
        "players": [p.serialize() for p in night.players]
    })

@socketio.on("chat")
def chat(data):
    game.chat(data)

@socketio.on("start_night")
def start_night(detective_guess):
    print('continuining')
    night = game.run_night(detective_guess)
    emit('newRound', {
        "round": game.day,
        # "mafiaEliminated": night.mafia_eliminated,
        # "detectiveEliminated": night.detective_eliminated,
        # "doctorSaved": night.doctor_saved,
        "players": [p.serialize() for p in night.players]
    })


if __name__ == '__main__':
    socketio.run(app, debug=True)