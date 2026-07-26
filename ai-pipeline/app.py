import os
import tempfile

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Data Load
from langchain_community.document_loaders import PyPDFLoader

# Data Transformation
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Data Embedding + Vector Store
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS

# LLM Model
from langchain_groq import ChatGroq

# Prompt Template
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough


embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY")
)


prompt = ChatPromptTemplate.from_template("""
You are a PDF question-answering chatbot.

Your only source of knowledge is the content provided in the context below, which comes from the user's uploaded PDF file.

Strict rules:
1. Answer only using the information present in the provided context.
2. Do not use your pretrained knowledge, general knowledge, assumptions, or outside information.
3. Do not add facts that are not explicitly present in the provided context.
4. Formulate the response in clear, grammatically correct, and professional English while preserving the meaning and important terminology of the context.
5. Use the same words and terminology from the context wherever appropriate.
6. Do not summarize the context if the question asks about a topic covered by multiple details.
7. Include all relevant information from the context that directly answers the user's question. Do not omit relevant facts, measurements, distances, definitions, or descriptions.
8. Do not add information that is not present in the context.
9. If the answer cannot be found in the context, respond exactly:
"I could not find the answer to this question in the uploaded PDF."
10. Do not guess or make up an answer.

Context:
{context}

Question:
{question}
""")


# Backend using FAST API
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("https://pdf-chatbot-frontend-ufa7.onrender.com", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {"message": "PDF Chatbot Backend is running"}


@app.post("/ask")
def ask(
    question: str = Form(...),
    file: UploadFile = File(...)
):

    print(question)
    print(file.filename)

    temp_file_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            temp_file.write(file.file.read())
            temp_file_path = temp_file.name

        pdf_loader = PyPDFLoader(temp_file_path)
        data = pdf_loader.load()

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=50
    )

    data_docs = text_splitter.split_documents(data)

    db = FAISS.from_documents(
        data_docs,
        embeddings
    )

    retriever = db.as_retriever(
        search_kwargs={"k": 2}
    )

    chain = (
        {
            "context": retriever,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
    )

    response = chain.invoke(question)

    return {
        "answer": response.content
    }


import uvicorn

port = int(os.getenv("PORT", 8000))

uvicorn.run(
    app,
    host="0.0.0.0",
    port=port
)