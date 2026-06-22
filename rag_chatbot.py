from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

# Load PDF
loader = PyPDFLoader("data/india  history.pdf")
docs = loader.load()

# Create splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

# Split document into chunks
chunks = splitter.split_documents(docs)

# Print information
print("Number of chunks:", len(chunks))
print("\nFirst chunk:\n")
print(chunks[0].page_content)

from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Embedding model loaded successfully!")

from langchain_chroma import Chroma

vector_store = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./db"
)

print("Vector database created successfully!")

# Configure Gemini (do this once)
genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


chat_history = ""

def ask_rag(query):

    results = vector_store.similarity_search(query, k=1)

    context = ""

    for doc in results:
        context += doc.page_content + "\n"

    prompt = f"""
    Context:
    {context}

    Question:
    {query}
    """

    try:
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return (
          "⚠️ Gemini API quota exceeded.\n\n"
          "Please wait a minute and try again, "
          "or use a new API key.\n\n"
          f"Error: {str(e)}"
       )

# Terminal chatbot (optional)
if __name__ == "__main__":

    while True:

        query = input("\nAsk your question (type exit to quit): ")

        if query.lower() == "exit":
            break

        answer = ask_rag(query)

        print("\nAnswer:\n")
        print(answer)