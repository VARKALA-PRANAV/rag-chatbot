from rag_chatbot import SimpleRAG


def test_search_returns_relevant_document():
    chatbot = SimpleRAG("docs")

    results = chatbot.search("python")
    assert results, "Expected at least one matched document"
    assert results[0][0] == "sample.txt"


def test_answer_contains_document_preview():
    chatbot = SimpleRAG("docs")

    answer = chatbot.answer("python")
    assert "sample.txt" in answer
    assert "Python" in answer
