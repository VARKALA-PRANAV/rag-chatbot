from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

# Configure Gemini
genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

# Load embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Load existing database
vector_store = Chroma(
    persist_directory="./db",
    embedding_function=embeddings
)


def ask_rag(query):
    try:
        results = vector_store.similarity_search(
            query,
            k=3
        )

        context = "\n".join(
            [doc.page_content for doc in results]
        )

        prompt = f"""
You are a helpful AI assistant.

Context:
{context}

Question:
{query}

Answer based only on the provided context.
"""

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:
        return (
            "⚠️ Error while generating response.\n\n"
            f"{str(e)}"
        )