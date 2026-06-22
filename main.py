from fastapi import FastAPI
from pydantic import BaseModel
from rag_chatbot import ask_rag
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ChatRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "RAG chatbot backend is running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    answer = ask_rag(request.question)

    return {
        "answer": answer
    }