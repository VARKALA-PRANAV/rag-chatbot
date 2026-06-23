from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from rag_chatbot import ask_rag

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # For testing. Later replace with your Vercel URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request model
class ChatRequest(BaseModel):
    question: str


# Home route
@app.get("/")
def home():
    return {
        "message": "RAG chatbot backend is running"
    }


# Chat route
@app.post("/chat")
def chat(request: ChatRequest):
    answer = ask_rag(request.question)
    return {
        "answer": answer
    }