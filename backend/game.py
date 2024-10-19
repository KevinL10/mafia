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
    mafia_eliminated: Optional[List[int]]
    detective_eliminated: Optional[int]
    doctor_saved: Optional[int]


class Game:
    def __init__(self, num_cpu=6):
        # self.roles[0] is the user -- always town person for now
        self.roles = [Roles.TOWN] * (1 + num_cpu)

        # todo: randomly generate
        self.roles[1] = Roles.DOCTOR
        self.roles[2] = Roles.DETECTIVE
        self.roles[3] = Roles.MAFIA


        self.state = State.NIGHT
        self.day = 1


    
    def chat(self, msg):
        print(msg)


    def run_night(self) -> NightData:
        self.day += 1


        # simulate nighttime happening
        time.sleep(1)
        return NightData([2, 33], None, 2)

        # compute who dies..
        