from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import logging

from langchain_ollama import OllamaLLM
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.schema import HumanMessage, AIMessage

# Logging setup
logging.basicConfig(level=logging.INFO)

# FastAPI app
app = FastAPI()

# Model initialization
model = OllamaLLM(model="llama3.2:1b")

# In-memory message history (for demo/testing only)
chat_history = ChatMessageHistory()

# Allow frontend connections (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing purposes, can restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model with validated personality options
class Prompt(BaseModel):
    message: str
    personality: Literal["Serious", "Funny", "Sarcastic", "None"]

# POST /chat endpoint
@app.post("/chat")
async def chat(prompt: Prompt, request: Request):
    logging.info(f"Received from {request.client.host} - Message: {prompt.message} | Personality: {prompt.personality}")

    # Add user message to history
    chat_history.add_user_message(prompt.message)

    # Format context history
    full_context = "\n".join(
        f"{'User' if isinstance(m, HumanMessage) else 'Bot'}: {m.content}"
        for m in chat_history.messages
    )

    # Choose style instruction based on personality
    style_prompt = {
        "None": "",
        "Serious": "You are a highly professional and serious assistant.",
        "Funny": "Respond with a light-hearted and funny tone.",
        "Sarcastic": "Respond with dry wit and sarcasm, but keep it helpful."
    }.get(prompt.personality, "")

    # Final prompt passed to model
    full_prompt = f"{style_prompt}\n\n{full_context}"

    # Generate response from the model
    response = model.invoke(full_prompt)

    # Add bot message to history
    chat_history.add_ai_message(response)

    return {"response": response}

# POST /clear endpoint
@app.post("/clear")
async def clear_chat():
    chat_history.clear()
    logging.info("Chat history cleared.")
    return {"status": "chat history cleared"}
