from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings

# Initialize LLM
llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model_name=settings.LLM_MODEL
)

# Initialize Embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Mock data for initial setup
initial_data = [
    "Our customer support hours are 9 AM to 5 PM, Monday to Friday.",
    "The return policy allows for returns within 30 days of purchase with a receipt.",
    "For technical issues, please visit our hardware troubleshooting page.",
    "We offer a 1-year limited warranty on all electronic products.",
    "To reset your password, click on 'Forgot Password' at the login screen."
]

# Create initial vector store
vectorstore = FAISS.from_texts(initial_data, embeddings)
retriever = vectorstore.as_retriever()

template = """You are a helpful and professional customer support voice agent. 
Use the following pieces of retrieved context to answer the user's question. 
Keep your responses concise and natural for a voice conversation.

Context:
{context}

Question: {question}

Answer:"""

prompt = ChatPromptTemplate.from_template(template)

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

async def get_rag_response(query: str) -> str:
    return rag_chain.invoke(query)
