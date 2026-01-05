// frontend/src/pages/HistoryPage.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Tabs, Tab, Spinner, Badge } from "react-bootstrap";
import { FaStar, FaBook, FaHeadphones, FaVolumeUp } from "react-icons/fa";
import { toast } from "react-toastify";
import ChatHistoryList from "../components/history/ChatHistoryList";
import { getVocabLists, getRecentWords } from "../services/vocabularyService";
import { getListeningHistory } from "../services/listeningService";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("chats");

  // State từ vựng
  const [vocabLists, setVocabLists] = useState([]);
  const [recentWords, setRecentWords] = useState([]);
  const [vocabStats, setVocabStats] = useState({ totalWords: 0, totalLists: 0 });
  const [loadingVocab, setLoadingVocab] = useState(false);

  // State luyện nghe
  const [listeningHistory, setListeningHistory] = useState([]);
  const [loadingListening, setLoadingListening] = useState(false);

  // Tải dữ liệu từ vựng
  const loadVocabularyData = async () => {
    if (loadingVocab) return;
    setLoadingVocab(true);
    try {
      const [listsRes, wordsRes] = await Promise.all([
        getVocabLists(),
        getRecentWords(20),
      ]);
      setVocabLists(listsRes.data.lists || []);
      setRecentWords(wordsRes.data.words || []);
      setVocabStats(wordsRes.data.stats || { totalWords: 0, totalLists: 0 });
    } catch (error) {
      console.error("Load vocabulary error:", error);
      toast.error("Không thể tải dữ liệu từ vựng");
    } finally {
      setLoadingVocab(false);
    }
  };

  // Tải lịch sử luyện nghe
  const loadListeningData = async () => {
    if (loadingListening) return;
    setLoadingListening(true);
    try {
      const response = await getListeningHistory(20);
      setListeningHistory(response.data.history || []);
    } catch (error) {
      console.error("Load listening history error:", error);
      toast.error("Không thể tải lịch sử luyện nghe");
    } finally {
      setLoadingListening(false);
    }
  };

  // Tải dữ liệu khi thay đổi tab
  useEffect(() => {
    if (activeTab === "vocabulary") {
      loadVocabularyData();
    } else if (activeTab === "listening") {
      loadListeningData();
    }
  }, [activeTab]);



  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container fluid className="history-page py-4">
      <Row className="mb-4">
        <Col>
          <h2>Learning History 📚</h2>
          <p className="text-muted">
            Review your learning progress
          </p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
                <Tab eventKey="chats" title="💬 Chat History">
                  <ChatHistoryList />
                </Tab>

                <Tab eventKey="vocabulary" title="📖 Vocabulary">
                  {loadingVocab ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                      <p className="text-muted mt-2">Đang tải...</p>
                    </div>
                  ) : (
                    <>
                      {/* Thống kê */}
                      <Row className="mb-4">
                        <Col md={6}>
                          <Card className="bg-primary text-white">
                            <Card.Body className="d-flex align-items-center">
                              <FaBook size={40} className="me-3" />
                              <div>
                                <h3 className="mb-0">{vocabStats.totalLists}</h3>
                                <small>Danh sách từ vựng</small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="bg-success text-white">
                            <Card.Body className="d-flex align-items-center">
                              <FaStar size={40} className="me-3" />
                              <div>
                                <h3 className="mb-0">{vocabStats.totalWords}</h3>
                                <small>Từ đã học</small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Danh sách */}
                      <h6 className="mb-3">📁 Danh sách từ vựng</h6>
                      {vocabLists.length === 0 ? (
                        <p className="text-muted">Chưa có danh sách nào</p>
                      ) : (
                        <Row className="mb-4">
                          {vocabLists.slice(0, 6).map((list) => (
                            <Col md={4} key={list._id} className="mb-3">
                              <Card className="h-100">
                                <Card.Body>
                                  <h6 className="mb-1">{list.name}</h6>
                                  <small className="text-muted">
                                    {list.words?.length || 0} từ • {formatDate(list.createdAt)}
                                  </small>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}

                      {/* Từ vựng gần đây */}
                      <h6 className="mb-3">📝 Từ vựng gần đây</h6>
                      {recentWords.length === 0 ? (
                        <p className="text-muted">Chưa có từ nào</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Từ</th>
                                <th>Nghĩa</th>
                                <th>Danh sách</th>
                                <th>Ngày thêm</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentWords.map((word) => (
                                <tr key={word._id}>
                                  <td>
                                    <strong>{word.word}</strong>
                                    {word.phonetic && (
                                      <small className="text-muted d-block">{word.phonetic}</small>
                                    )}
                                  </td>
                                  <td>{word.vietnamese || word.definition}</td>
                                  <td>
                                    <Badge bg="secondary">{word.listId?.name || "N/A"}</Badge>
                                  </td>
                                  <td>
                                    <small>{formatDate(word.createdAt)}</small>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </Tab>

                <Tab eventKey="listening" title="🎧 Luyện Nghe">
                  {loadingListening ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                      <p className="text-muted mt-2">Đang tải...</p>
                    </div>
                  ) : (
                    <>
                      {/* History List */}

                      {/* Danh sách lịch sử */}
                      <h6 className="mb-3">📋 Lịch sử luyện nghe</h6>
                      {listeningHistory.length === 0 ? (
                        <p className="text-muted text-center py-4">
                          Chưa có lịch sử luyện nghe. Hãy bắt đầu luyện tập!
                        </p>
                      ) : (
                        <div className="listening-history-list">
                          {listeningHistory.map((item) => (
                            <Card key={item._id} className="mb-3">
                              <Card.Body>
                                <Row className="align-items-center">
                                  <Col md={9}>
                                    <h6 className="mb-1">"{item.originText}"</h6>
                                    <small className="text-muted d-block mb-2">
                                      Bạn nói: "{item.userText}"
                                    </small>
                                  </Col>
                                  <Col md={3} className="text-end">
                                    <small className="text-muted">
                                      {formatDate(item.createdAt)}
                                    </small>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HistoryPage;
