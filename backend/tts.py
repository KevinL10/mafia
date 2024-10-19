from cartesia import Cartesia
from io import BytesIO
from flask_socketio import emit
import os
import ffmpeg
import tempfile


class TTSClient:
    def __init__(self):
        self.client = Cartesia(api_key=os.environ.get("CARTESIA_API_KEY"))

        self.voice_id = "a0e99841-438c-4a64-b679-ae501e7d6091"
        self.model_id = "sonic-english"

    def to_wav(self, transcript: str) -> bytes:
        output_format = {
            "container": "raw",
            "encoding": "pcm_f32le",
            "sample_rate": 44100,
        }

        with tempfile.NamedTemporaryFile("wb", delete_on_close=False) as f:
            ws = self.client.tts.websocket()

            # Generate and stream audio.
            for output in ws.send(
                model_id=self.model_id,
                transcript=transcript,
                voice_id=self.voice_id,
                stream=True,
                output_format=output_format,
            ):
                buffer = output["audio"]
                f.write(buffer)

            ws.close()

            print("[x] running ffmpeg")
            print(os.path.exists(f.name))
            ffmpeg.input(f.name, format="f32le").output(f.name + ".wav").run()

            with open(f.name + ".wav", "rb") as f:
                wav_bytes = f.read()
            
            return wav_bytes


        # # f.seek(0)
        # # print(f.read()[:10])
