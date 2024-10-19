from cartesia import Cartesia
from io import BytesIO
from flask_socketio import emit
import os
import ffmpeg
import tempfile
import time


class TTSClient:
    def __init__(self):
        self.client = Cartesia(api_key=os.environ.get("CARTESIA_API_KEY"))

        # self.NAMES = [
        #     player_name,
        #     "Olivia",
        #     "Liam",
        #     "Hiroshi",
        #     "Sophia",
        #     "Zainab",
        #     "Ethan",
        # ]
        self.voices = [
            None,
            "043cfc81-d69f-4bee-ae1e-7862cb358650",     # Olivia
            "40104aff-a015-4da1-9912-af950fbec99e",     # Liam
            "e8a863c6-22c7-4671-86ca-91cacffc038d",     # Hiroshi
            "a01c369f-6d2d-4185-bc20-b32c225eab70",     # Sophia
            "3b554273-4299-48b9-9aaf-eefd438e3941",     # Zainab
            "726d5ae5-055f-4c3d-8355-d9677de68937"      # Ethan

        ]
        self.model_id = "sonic-english"
        self.last_duration = None

    def to_wav(self, player: int, transcript: str) -> bytes:
        output_format = {
            "container": "raw",
            "encoding": "pcm_f32le",
            "sample_rate": 44100,
        }

        voice_id = self.voices[player]
        start = time.time()
        with tempfile.NamedTemporaryFile("wb", delete_on_close=False) as f:
            ws = self.client.tts.websocket()

            # Generate and stream audio.
            for output in ws.send(
                model_id=self.model_id,
                transcript=transcript,
                voice_id=voice_id,
                stream=True,
                output_format=output_format,
                _experimental_voice_controls={"speed": "fastest"},
            ):
                buffer = output["audio"]
                f.write(buffer)

            mid = time.time()
            ws.close()

            print("[x] running ffmpeg")
            print(os.path.exists(f.name))
            ffmpeg.input(f.name, format="f32le").output(f.name + ".wav").run()

            with open(f.name + ".wav", "rb") as f:
                wav_bytes = f.read()

            self.last_duration = (mid - start, time.time() - mid)

            return wav_bytes

        # # f.seek(0)
        # # print(f.read()[:10])
