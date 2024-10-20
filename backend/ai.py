import os

from groq import Groq
import time


class GroqClient:
    def __init__(self):
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )
        self.last_duration = None

    def complete(self, msg: str) -> str:
        # start = time.time()
        # chat_completion = self.client.chat.completions.create(
        #     messages=[
        #         {
        #             "role": "user",
        #             "content": msg,
        #         }
        #     ],
        #     model="llama-3.1-8b-instant",
        # )

        # self.last_duration = time.time() - start
        # time.sleep
        time.sleep(2)
        return "tmp complete"
        # return chat_completion.choices[0].message.content
