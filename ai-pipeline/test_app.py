import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Data Load
from langchain_community.document_loaders import PyPDFLoader
pdf_loader = PyPDFLoader("data/cricket_tutorial.pdf")
data = pdf_loader.load()

# Data Transformation
from langchain_text_splitters import RecursiveCharacterTextSplitter
text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
data_docs = text_splitter.split_documents(data)

# Data Embedding + Vector Store
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
embeddings = HuggingFaceEmbeddings(model="all-MiniLM-L6-v2")
db = FAISS.from_documents(data_docs, embeddings)

# Retriever
retriever = db.as_retriever(search_kwargs={"k": 5})

# LLM Model
from langchain_groq import ChatGroq
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# Prompt Template
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

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

chain = (
    {
        "context": retriever,
        "question": RunnablePassthrough()
    }
    | prompt
    | llm
)

question = input("Ask a question: ")

response = chain.invoke(question)

print(response.content)