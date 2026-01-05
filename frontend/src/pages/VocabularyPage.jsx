// frontend/src/pages/VocabularyPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  ListGroup,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { FaSearch, FaBook, FaVolumeUp, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getVocabLists,
  createVocabList,
  getVocabListDetail,
  addWordToListFromVietnamese,
} from "../services/vocabularyService";

const VocabularyPage = () => {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newVietnameseWord, setNewVietnameseWord] = useState("");
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoadingLists(true);
        const response = await getVocabLists();
        setLists(response.data.lists || []);
      } catch {
        toast.error("Không tải được danh sách từ vựng");
      } finally {
        setLoadingLists(false);
      }
    };

    fetchLists();
  }, []);

  const loadListWords = async (listId) => {
    try {
      setLoadingWords(true);
      setSelectedListId(listId);
      setSelectedWord(null);
      setWords([]);
      const response = await getVocabListDetail(listId);
      const list = response.data.list;
      const listWords = Array.isArray(list.words) ? list.words : [];
      const mappedWords = listWords.map((w) => ({
        id: w._id,
        word: w.word,
        phonetic: w.phonetic,
        partOfSpeech: w.partOfSpeech,
        definition: w.definition,
        vietnamese: w.vietnamese,
        examples: Array.isArray(w.examples) ? w.examples : [],
        otherMeanings: Array.isArray(w.otherMeanings) ? w.otherMeanings : [],
        level: w.level || "beginner",
        isFavorite: w.isFavorite || false,
      }));
      setWords(mappedWords);
    } catch {
      toast.error("Không tải được từ trong danh sách");
    } finally {
      setLoadingWords(false);
    }
  };

  const handleCreateList = async (event) => {
    event.preventDefault();
    const name = newListName.trim();
    if (!name) {
      toast.warning("Vui lòng nhập tên danh sách");
      return;
    }

    try {
      setCreatingList(true);
      const response = await createVocabList({ name });
      const created = response.data.list;
      setLists((prev) => [created, ...prev]);
      setNewListName("");
      toast.success("Tạo danh sách thành công");
    } catch (error) {
      const message =
        error.response?.data?.message || "Không tạo được danh sách mới";
      toast.error(message);
    } finally {
      setCreatingList(false);
    }
  };

  const handleAddWord = async (event) => {
    event.preventDefault();
    if (!selectedListId) {
      toast.warning("Vui lòng chọn danh sách trước");
      return;
    }

    const input = newVietnameseWord.trim();
    if (!input) {
      toast.warning("Vui lòng nhập từ tiếng Việt");
      return;
    }

    try {
      setAddingWord(true);
      const response = await addWordToListFromVietnamese(
        selectedListId,
        input
      );
      const w = response.data.word;
      const mapped = {
        id: w._id,
        word: w.word,
        phonetic: w.phonetic,
        partOfSpeech: w.partOfSpeech,
        definition: w.definition,
        vietnamese: w.vietnamese,
        examples: Array.isArray(w.examples) ? w.examples : [],
        otherMeanings: Array.isArray(w.otherMeanings) ? w.otherMeanings : [],
        level: w.level || "beginner",
        isFavorite: w.isFavorite || false,
      };
      setWords((prev) => [mapped, ...prev]);
      setSelectedWord(mapped);
      setNewVietnameseWord("");
      toast.success("Đã thêm từ mới bằng AI");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Không thêm được từ mới, vui lòng thử lại";
      toast.error(message);
    } finally {
      setAddingWord(false);
    }
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
  };

  const handlePronounce = (word) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.warning("Text-to-speech not supported in this browser");
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "danger";
      default:
        return "secondary";
    }
  };

  const filteredWords = words.filter((item) =>
    item.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="vocabulary-page py-4">
      <Row className="mb-4">
        <Col>
          <h2>Vocabulary Learning 📚</h2>
          <p className="text-muted">
            Tạo danh sách theo chủ đề và thêm từ mới bằng AI
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Danh sách từ vựng</h6>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateList} className="mb-3">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Tên danh sách (ví dụ: Thể thao)"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    disabled={creatingList}
                  />
                  <Button type="submit" disabled={creatingList}>
                    {creatingList ? (
                      <Spinner
                        size="sm"
                        animation="border"
                        role="status"
                      />
                    ) : (
                      "Tạo"
                    )}
                  </Button>
                </InputGroup>
              </Form>

              {loadingLists ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : lists.length === 0 ? (
                <div className="text-center text-muted py-3">
                  Chưa có danh sách nào
                </div>
              ) : (
                <ListGroup
                  variant="flush"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  {lists.map((list) => (
                    <ListGroup.Item
                      key={list._id}
                      action
                      active={selectedListId === list._id}
                      onClick={() => loadListWords(list._id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{list.name}</strong>
                          {list.topic ? (
                            <div className="text-muted small">
                              {list.topic}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {selectedListId ? (
            <>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">Thêm từ mới bằng tiếng Việt</h6>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddWord}>
                    <Row className="align-items-center">
                      <Col md={8} className="mb-2 mb-md-0">
                        <Form.Control
                          type="text"
                          placeholder="Nhập từ hoặc cụm từ tiếng Việt..."
                          value={newVietnameseWord}
                          onChange={(e) =>
                            setNewVietnameseWord(e.target.value)
                          }
                          disabled={addingWord}
                        />
                      </Col>
                      <Col md={4} className="text-md-end">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={addingWord}
                        >
                          {addingWord ? (
                            <Spinner
                              size="sm"
                              animation="border"
                              role="status"
                              className="me-2"
                            />
                          ) : null}
                          Thêm bằng AI
                        </Button>
                      </Col>
                    </Row>
                    <div className="text-muted small mt-2">
                      AI sẽ gợi ý từ tiếng Anh phù hợp, nghĩa và ví dụ.
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              <Row>
                <Col lg={5}>
                  <Card className="mb-4">
                    <Card.Header>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Tìm kiếm từ..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Card.Header>
                    {loadingWords ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" />
                      </div>
                    ) : (
                      <ListGroup
                        variant="flush"
                        style={{ maxHeight: "500px", overflowY: "auto" }}
                      >
                        {filteredWords.length === 0 ? (
                          <ListGroup.Item className="text-center text-muted">
                            Chưa có từ nào trong danh sách
                          </ListGroup.Item>
                        ) : (
                          filteredWords.map((item) => (
                            <ListGroup.Item
                              key={item.id}
                              action
                              active={selectedWord?.id === item.id}
                              onClick={() => handleWordClick(item)}
                              className="vocab-item"
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <strong>{item.word}</strong>
                                    {item.isFavorite && (
                                      <FaStar
                                        className="text-warning"
                                        size={14}
                                      />
                                    )}
                                  </div>
                                  <small className="text-muted d-block">
                                    {item.phonetic}
                                  </small>
                                </div>
                                <Badge bg={getLevelColor(item.level)}>
                                  {item.level}
                                </Badge>
                              </div>
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    )}
                  </Card>
                </Col>

                <Col lg={7}>
                  {selectedWord ? (
                    <Card>
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>
                          <h4 className="mb-1">{selectedWord.word}</h4>
                          <small className="text-muted">
                            {selectedWord.phonetic}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              handlePronounce(selectedWord.word)
                            }
                          >
                            <FaVolumeUp className="me-1" />
                            Pronounce
                          </Button>
                          <Button
                            variant={
                              selectedWord.isFavorite
                                ? "warning"
                                : "outline-warning"
                            }
                            size="sm"
                            disabled
                          >
                            <FaStar />
                          </Button>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-4">
                          <Badge bg="info" className="mb-2">
                            {selectedWord.partOfSpeech || "word"}
                          </Badge>
                          <h6 className="mt-3">Nghĩa tiếng Việt:</h6>
                          <p className="mb-2">
                            {selectedWord.vietnamese || "Không có dữ liệu"}
                          </p>
                          <h6>Definition:</h6>
                          <p className="mb-2">
                            {selectedWord.definition || "No definition"}
                          </p>
                        </div>

                        <div className="mb-4">
                          <h6>Examples:</h6>
                          {selectedWord.examples &&
                          selectedWord.examples.length > 0 ? (
                            <ul>
                              {selectedWord.examples.map(
                                (example, index) => (
                                  <li key={index} className="mb-2">
                                    {example}
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() =>
                                        handlePronounce(example)
                                      }
                                    >
                                      <FaVolumeUp size={12} />
                                    </Button>
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <div className="text-muted">
                              Không có ví dụ minh họa
                            </div>
                          )}
                        </div>

                        {selectedWord.otherMeanings &&
                        selectedWord.otherMeanings.length > 0 ? (
                          <div className="mb-4">
                            <h6>Other meanings:</h6>
                            <ul>
                              {selectedWord.otherMeanings.map((m, idx) => (
                                <li key={idx} className="mb-2">
                                  <div className="fw-semibold">
                                    {m.definition || "No definition"}
                                  </div>
                                  {m.vietnamese ? (
                                    <div>
                                      <span className="text-muted">Nghĩa tiếng Việt: </span>
                                      {m.vietnamese}
                                    </div>
                                  ) : null}
                                  {Array.isArray(m.examples) &&
                                  m.examples.length > 0 ? (
                                    <ul className="mt-1">
                                      {m.examples.map((ex, j) => (
                                        <li key={j}>
                                          {ex}
                                          <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() =>
                                              handlePronounce(ex)
                                            }
                                          >
                                            <FaVolumeUp size={12} />
                                          </Button>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div>
                          <h6>Level:</h6>
                          <Badge
                            bg={getLevelColor(selectedWord.level)}
                            className="text-uppercase"
                          >
                            {selectedWord.level}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Card className="text-center p-5">
                      <FaBook size={60} className="text-muted mb-3" />
                      <h5>Chọn một từ để xem chi tiết</h5>
                      <p className="text-muted">
                        Chọn từ bên trái để xem nghĩa, ví dụ và phát âm
                      </p>
                    </Card>
                  )}
                </Col>
              </Row>
            </>
          ) : (
            <Card className="text-center p-5">
              <FaBook size={60} className="text-muted mb-3" />
              <h5>Chọn hoặc tạo danh sách từ vựng</h5>
              <p className="text-muted">
                Tạo danh sách mới theo chủ đề, sau đó thêm từ bằng tiếng Việt
                để AI gợi ý từ tiếng Anh phù hợp.
              </p>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default VocabularyPage;
