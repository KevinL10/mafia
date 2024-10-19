import random
from enum import Enum
from flask_socketio import SocketIO, emit, join_room, leave_room
from typing import Optional, List
from dataclasses import dataclass
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
class NightData():
    # mafia_eliminated: Optional[List[int]]
    # detective_eliminated: Optional[int]
    # doctor_saved: Optional[int]

    summary: str

    # technically, the frontend can keep track of who's still alive or not..
    # but just gonna pass this explicitly anyway 
    alive_state: List[bool]


class Game:
    def __init__(self, num_cpu=6):
        # self.roles[0] is the user -- always town person for now
        self.num_players = num_cpu + 1
        self.roles = [Roles.TOWN] * self.num_players
        self.alive = [True] * self.num_players

        # todo: randomly generate roles
        self.mafia = [3]
        self.detective = 2
        self.doctor = 1

        self.roles[1] = Roles.DOCTOR
        self.roles[2] = Roles.DETECTIVE
        self.roles[3] = Roles.MAFIA


        self.state = State.NIGHT
        self.day = 1


    
    def chat(self, msg):
        print(msg)


    def run_night(self) -> NightData:
        self.day += 1

        killable = [i for i in range(self.num_players) if i not in self.mafia and self.alive[i]]

        # todo: this should be decided by the LLMs 
        mafia_tentative = random.sample(killable, len(self.mafia))
        detective_guess = random.randint(0, self.num_players)
        doctor_guess = random.randint(0, self.num_players)

        mafia_eliminated = []
        doctor_saved = None
        detective_eliminated = None

        for maybe_eliminated in mafia_tentative:
            if maybe_eliminated == doctor_guess:
                doctor_saved = maybe_eliminated
            else:
                self.alive[maybe_eliminated] = False
                mafia_eliminated.append(maybe_eliminated)

        if detective_guess in self.mafia:
            detective_eliminated = detective_guess
            


        # todo: just generate a natural language summary on the backend and send that as an update to the frontend

        # simulate nighttime happening
        time.sleep(1)
        # return NightData(mafia_eliminated, detective_eliminated, doctor_saved, self.alive)
        return NightData("some stuff happened", self.alive)

        # compute who dies..
        