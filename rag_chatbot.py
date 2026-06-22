from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
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

# Load PDF
loader = PyPDFLoader("data/india  history.pdf")
docs = loader.load()

# Split text
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_documents(docs)

# Load embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Create vector store in memory (NO persist_directory)
vector_store = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings
)


def ask_rag(query):
    try:
        # Retrieve relevant chunks
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


# Terminal testing
if __name__ == "__main__":
    while True:
        query = input("Ask: ")

        if query.lower() == "exit":
            break

        answer = ask_rag(query)

        print("\nAnswer:\n")
        print(answer)