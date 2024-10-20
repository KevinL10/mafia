import random
from enum import Enum
from flask_socketio import SocketIO, emit, join_room, leave_room
from typing import Optional, List
from dataclasses import dataclass
from ai import GroqClient
from tts import TTSClient
import time


class Roles(Enum):
    TOWN = "townsperson"
    DOCTOR = "doctor"
    DETECTIVE = "detective"
    MAFIA = "mafia"


class State(Enum):
    DAY = 0
    NIGHT = 1


@dataclass
class Player:
    name: str
    personality: str
    alive: bool
    role: Roles

    def serialize(self) -> dict:
        data = {"name": self.name, "alive": self.alive}

        if self.role == Roles.MAFIA and not self.alive:
            data["role"] = self.role.value
        

        # DEBUG: always show
        data["role"] = self.role.value
        return data


@dataclass
class NightData:
    # mafia_eliminated: Optional[List[int]]
    # detective_eliminated: Optional[int]
    # doctor_saved: Optional[int]

    summary: str
    players: List[Player]


class Game:
    def __init__(self, player_name: str, num_cpu=6):
        # self.roles[0] is the user -- always town person for now
        self.num_players = num_cpu + 1
        self.PERSONALITIES = [
        "The Smooth Talker: Charismatic and persuasive, excels at convincing others of their innocence.",
        "The Silent Observer: Quiet and introverted, highly observant and analytical.",
        "The Accusatory Blame-Shifter: Aggressive and defensive, quick to accuse others without substantial evidence.",
        "The Charismatic Leader: Natural leader, inspiring and authoritative, guides the group's strategy.",
        "The Nervous Liar: Anxious and inconsistent, struggles to maintain lies under pressure.",
        "The Analytical Thinker: Logical and methodical, detail-oriented and strategic in decision-making.",
        "The Jokester: Humorous and unpredictable, uses humor to defuse tension and distract others.",
        "The Protective Guardian: Loyal and nurturing, looks out for other players and advocates for their safety."
    ]

        self.NAMES = [
            player_name,
            "Olivia",
            "Liam",
            "Hiroshi",
            "Sophia",
            "Zainab",
            "Ethan",
        ]
        self.players = [
            Player(self.NAMES[i], self.PERSONALITIES[i], True, Roles.TOWN) for i in range(self.num_players)
        ]


        self.players[1].role = Roles.DOCTOR
        self.players[2].role = Roles.DETECTIVE
        self.players[3].role = Roles.MAFIA

        # todo: randomly generate roles
        self.mafia = [3]
        self.detective = 2
        self.doctor = 1

        self.client = GroqClient()
        self.tts_client = TTSClient()

        self.state = State.NIGHT
        self.day = 1

        # tuples of (player id, message)
        self.chat_history = []

    def chat(self, msg):
        self.chat_history.append((0, msg))

    def guess_mafia(self, player):
        self.detective_guess = player

    def run_day(self, socketio):
        self.state = State.DAY
        # ai agents chat and send messages back to the websocket
        # while self.state == State.DAY:
        for _ in range(5):
            agent = random.randint(1, self.num_players - 1)

            prompt = f"""
You are playing the party game Mafia. Your name is {self.players[agent].name} and your role is {self.players[agent].role.value}.

You should act accordingly with the following personality: {self.players[agent].personality}.

Here is the history of chat messages:
{'\n'.join(f"{self.players[player].name}: {msg}" for (player, msg) in self.chat_history)}

Here is the status of the players:
{'\n'.join(f"{player.name}: {'alive' if player.alive else 'dead'}" for player in self.players)}

Remember that this is Mafia - you can lie about your role, distort, play the truth - whatever it takes to win, regardless if you're good or bad.
Pay attention to the previous chat history, and interact with the other players. Keep your message below three sentences. The text will be
spoken verbatim, so do not include any subtexts or asterisks.
"""
            message = self.client.complete(prompt)
            print("chat", self.client.last_duration)

            emit("aiMessage", {"player": agent, "text": message})

            wav_bytes = self.tts_client.to_wav(agent, message)
            emit("audio", wav_bytes)
            print("tts", self.tts_client.last_duration)

            self.chat_history.append((agent, message))

            socketio.sleep(2)
            pass

        # send a bunch of websocket results
        pass

    def run_night(self, detective_guess: int) -> NightData:
        self.state = State.NIGHT

        killable = [
            i
            for i in range(self.num_players)
            if i not in self.mafia and self.players[i].alive
        ]

        # todo: this should be decided by the LLMs
        mafia_tentative = random.sample(killable, len(self.mafia))
        # detective_guess = random.randint(0, self.num_players)
        doctor_guess = random.randint(0, self.num_players)

        mafia_killed = []

        doctor_saved = None
        detective_eliminated = None

        for p in mafia_tentative:
            if doctor_guess in mafia_tentative:
                doctor_saved = doctor_guess
            else:
                self.players[p].alive = False
                mafia_killed.append(p)

        if detective_guess in self.mafia:
            detective_eliminated = detective_guess

            self.players[detective_guess].alive = False

        prompt = f"""
Write a summary for the previous night {self.day} of a mafia game. Keep the summary below three sentences. Do not include any special characters or formatting.

The mafia killed {', '.join(self.players[i].name for i in mafia_killed)}.
"""
        if doctor_saved:
            prompt += f" {self.players[doctor_saved].name} was saved by a doctor."

        if detective_eliminated:
            prompt += f" The detective discovered that {self.players[detective_eliminated].name} was part of the Mafia and eliminated them."

        print(prompt)
        summary = self.client.complete(prompt)
        print("getting tts wav")
        # wav_bytes = self.tts_clientdd.to_wav(summary[:100])
        # print(len(wav_bytes))
        # emit('audio', wav_bytes)

        self.day += 1
        print(prompt)
        # todo: just generate a natural language summary on the backend and send that as an update to the frontend

        # simulate nighttime happening
        # time.sleep(1)
        # return NightData(mafia_eliminated, detective_eliminated, doctor_saved, self.alive)
        return NightData(summary, self.players)

        # compute who dies..
