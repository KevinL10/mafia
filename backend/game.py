import random
from enum import Enum
from flask_socketio import SocketIO, emit, join_room, leave_room
from typing import Optional, List
from dataclasses import dataclass
from ai import client
import time

class Roles(Enum):
    TOWN = 0
    DOCTOR = 1
    DETECTIVE = 2
    MAFIA = 3


class State(Enum):
    DAY = 0
    NIGHT = 1

@dataclass
class Player:
    name: str
    alive: bool
    role: Roles

    def serialize(self) -> dict:
        return {"name": self.name, "alive": self.alive}

@dataclass
class NightData():
    # mafia_eliminated: Optional[List[int]]
    # detective_eliminated: Optional[int]
    # doctor_saved: Optional[int]

    summary: str
    players: List[Player]




class Game:
    def __init__(self, player_name: str, num_cpu=6):
        # self.roles[0] is the user -- always town person for now
        self.num_players = num_cpu + 1
        
        self.NAMES = [player_name, "Olivia", "Liam", "Hiroshi", "Sophia", "Zainab", "Ethan"]
        self.players = [Player(self.NAMES[i], True, Roles.TOWN) for i in range(self.num_players)]

        self.players[1].role = Roles.DOCTOR
        self.players[2].role = Roles.DETECTIVE
        self.players[3].role = Roles.MAFIA

        # todo: randomly generate roles
        self.mafia = [3]
        self.detective = 2
        self.doctor = 1



        self.state = State.NIGHT
        self.day = 1


    
    def chat(self, msg):
        print(msg)

    def guess_mafia(self, player):
        self.detective_guess = player

    def run_night(self, detective_guess: int) -> NightData:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": "Explain the importance of fast language models",
                }
            ],
            model="llama3-8b-8192",
        )

        print(chat_completion.choices[0].message.content)
        self.day += 1

        killable = [i for i in range(self.num_players) if i not in self.mafia and self.players[i].alive]

        # todo: this should be decided by the LLMs 
        mafia_tentative = random.sample(killable, len(self.mafia))
        # detective_guess = random.randint(0, self.num_players)
        doctor_guess = random.randint(0, self.num_players)

        mafia_eliminated = []
        doctor_saved = None
        detective_eliminated = None

        for maybe_eliminated in mafia_tentative:
            if maybe_eliminated == doctor_guess:
                doctor_saved = maybe_eliminated
            else:
                self.players[maybe_eliminated].alive = False
                mafia_eliminated.append(maybe_eliminated)

        if detective_guess in self.mafia:
            detective_eliminated = detective_guess

            self.players[detective_guess].alive =  False
            


        # todo: just generate a natural language summary on the backend and send that as an update to the frontend

        # simulate nighttime happening
        time.sleep(1)
        # return NightData(mafia_eliminated, detective_eliminated, doctor_saved, self.alive)
        return NightData("some stuff happened", self.players)

        # compute who dies..
        