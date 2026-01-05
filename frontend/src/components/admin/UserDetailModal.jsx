// frontend/src/components/admin/UserDetailModal.jsx
import { useState } from "react";
import { Modal, Tabs, Tab, Table, Badge, Row, Col, Card, Button, Spinner, ListGroup, Accordion } from "react-bootstrap";
import { FaUser, FaComments, FaBook, FaEye, FaArrowLeft, FaList } from "react-icons/fa";
import { getUserVocabularyLists, getUserVocabularyListDetail } from "../../services/userService";

const UserDetailModal = ({ show, onHide, user, chatHistory, listeningHistory, vocabStats, files }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [vocabLists, setVocabLists] = useState([]);
    const [loadingVocab, setLoadingVocab] = useState(false);
    const [vocabLoaded, setVocabLoaded] = useState(false);
    const [selectedList, setSelectedList] = useState(null);
    const [loadingListDetail, setLoadingListDetail] = useState(false);
    const [selectedListening, setSelectedListening] = useState(null);

    if (!user) return null;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleViewChatMessages = (chat) => {
        setSelectedChat(chat);
    };

    const handleBackToChats = () => {
        setSelectedChat(null);
    };

    const handleLoadVocabulary = async () => {
        if (vocabLoaded) return;
        setLoadingVocab(true);
        try {
            const response = await getUserVocabularyLists(user._id);
            setVocabLists(response.data.lists || []);
            setVocabLoaded(true);
        } catch (error) {
            console.error("Failed to load vocabulary lists:", error);
        } finally {
            setLoadingVocab(false);
        }
    };

    const handleViewListDetail = async (list) => {
        setLoadingListDetail(true);
        try {
            const response = await getUserVocabularyListDetail(user._id, list._id);
            setSelectedList(response.data.list);
        } catch (error) {
            console.error("Failed to load list detail:", error);
        } finally {
            setLoadingListDetail(false);
        }
    };

    const handleBackToLists = () => {
        setSelectedList(null);
    };

    const handleViewListening = (item) => {
        setSelectedListening(item);
    };

    const handleBackToListening = () => {
        setSelectedListening(null);
    };

    const handleModalHide = () => {
        setSelectedChat(null);
        setSelectedList(null);
        setSelectedListening(null);
        setVocabLists([]);
        setVocabLoaded(false);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleModalHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaUser className="me-2" /> Detail: {user.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <div className="mb-3">
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                        alt={user.name}
                                        className="rounded-circle"
                                        width="80"
                                        height="80"
                                    />
                                </div>
                                <h5>{user.name}</h5>
                                <p className="text-muted mb-1">{user.email}</p>
                                <Badge bg={user.isActive ? "success" : "danger"}>
                                    {user.isActive ? "Active" : "Locked"}
                                </Badge>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={9}>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Card className="h-100">
                                    <Card.Body className="text-center">
                                        <FaComments size={30} className="text-primary mb-2" />
                                        <h4>{user.totalChats || 0}</h4>
                                        <small>Total Chats</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Card className="h-100">
                                    <Card.Body className="text-center">
                                        <FaBook size={30} className="text-success mb-2" />
                                        <h4>{vocabStats?.totalWords || 0}</h4>
                                        <small>Words Learned</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Card className="h-100">
                                    <Card.Body className="text-center">
                                        <FaList size={30} className="text-info mb-2" />
                                        <h4>{vocabStats?.totalLists || 0}</h4>
                                        <small>Vocab Lists</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Tabs defaultActiveKey="chats" className="mb-3" onSelect={(k) => k === 'vocabulary' && handleLoadVocabulary()}>
                    <Tab eventKey="chats" title={<><FaComments className="me-1" /> Chat History</>}>
                        {selectedChat ? (
                            // Xem tin nhắn chat
                            <div>
                                <Button variant="outline-secondary" size="sm" className="mb-3" onClick={handleBackToChats}>
                                    <FaArrowLeft className="me-1" /> Quay lại danh sách
                                </Button>
                                <Card>
                                    <Card.Header>
                                        <strong>{selectedChat.sessionName}</strong>
                                        <Badge bg="info" className="ms-2">{selectedChat.topic}</Badge>
                                        <small className="text-muted ms-2">{formatDate(selectedChat.createdAt)}</small>
                                    </Card.Header>
                                    <Card.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
                                        {selectedChat.messages && selectedChat.messages.length > 0 ? (
                                            selectedChat.messages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`mb-3 p-2 rounded ${msg.role === "user"
                                                        ? "bg-primary text-white ms-5"
                                                        : msg.role === "assistant"
                                                            ? "bg-light me-5"
                                                            : "bg-secondary text-white"
                                                        }`}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <Badge bg={msg.role === "user" ? "light" : "secondary"} text={msg.role === "user" ? "dark" : "light"}>
                                                            {msg.role === "user" ? "👤 User" : msg.role === "assistant" ? "🤖 AI" : "⚙️ System"}
                                                        </Badge>
                                                        {msg.timestamp && (
                                                            <small className={msg.role === "user" ? "text-light" : "text-muted"}>
                                                                {formatDate(msg.timestamp)}
                                                            </small>
                                                        )}
                                                    </div>
                                                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-muted">Không có tin nhắn trong session này</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </div>
                        ) : (
                            // Danh sách phiên chat
                            chatHistory && chatHistory.length > 0 ? (
                                <Table hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Topic</th>
                                            <th>Session Name</th>
                                            <th>Messages</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chatHistory.map((chat) => (
                                            <tr key={chat._id}>
                                                <td><Badge bg="info">{chat.topic}</Badge></td>
                                                <td>{chat.sessionName}</td>
                                                <td><Badge bg="secondary">{chat.messages?.length || 0}</Badge></td>
                                                <td>{formatDate(chat.createdAt)}</td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleViewChatMessages(chat)}
                                                    >
                                                        <FaEye className="me-1" /> Xem
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-center text-muted p-4">No chat history found</p>
                            )
                        )}
                    </Tab>

                    <Tab eventKey="vocabulary" title={<><FaBook className="me-1" /> Vocabulary Lists</>}>
                        {loadingVocab ? (
                            <div className="text-center p-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2">Đang tải danh sách từ vựng...</p>
                            </div>
                        ) : selectedList ? (
                            // Xem chi tiết danh sách từ vựng
                            <div>
                                <Button variant="outline-secondary" size="sm" className="mb-3" onClick={handleBackToLists}>
                                    <FaArrowLeft className="me-1" /> Quay lại danh sách
                                </Button>
                                <Card>
                                    <Card.Header>
                                        <strong>{selectedList.name}</strong>
                                        {selectedList.topic && <Badge bg="info" className="ms-2">{selectedList.topic}</Badge>}
                                        <Badge bg="success" className="ms-2">{selectedList.words?.length || 0} từ</Badge>
                                    </Card.Header>
                                    <Card.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
                                        {selectedList.description && (
                                            <p className="text-muted mb-3">{selectedList.description}</p>
                                        )}
                                        {selectedList.words && selectedList.words.length > 0 ? (
                                            <Accordion>
                                                {selectedList.words.map((word, idx) => (
                                                    <Accordion.Item key={word._id || idx} eventKey={String(idx)}>
                                                        <Accordion.Header>
                                                            <div className="d-flex justify-content-between w-100 me-3">
                                                                <div>
                                                                    <strong className="text-primary">{word.word}</strong>
                                                                    {word.phonetic && <span className="text-muted ms-2">{word.phonetic}</span>}
                                                                    {word.partOfSpeech && <Badge bg="secondary" className="ms-2">{word.partOfSpeech}</Badge>}
                                                                </div>
                                                                <span className="text-success">{word.vietnamese}</span>
                                                            </div>
                                                        </Accordion.Header>
                                                        <Accordion.Body>
                                                            {word.definition && (
                                                                <p><strong>Definition:</strong> {word.definition}</p>
                                                            )}
                                                            {word.level && (
                                                                <p><strong>Level:</strong> <Badge bg={word.level === 'beginner' ? 'success' : word.level === 'intermediate' ? 'warning' : 'danger'}>{word.level}</Badge></p>
                                                            )}
                                                            {word.examples && word.examples.length > 0 && (
                                                                <div>
                                                                    <strong>Examples:</strong>
                                                                    <ul className="mb-0">
                                                                        {word.examples.map((ex, i) => (
                                                                            <li key={i} className="text-muted">{ex}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {word.otherMeanings && word.otherMeanings.length > 0 && (
                                                                <div className="mt-2">
                                                                    <strong>Other Meanings:</strong>
                                                                    {word.otherMeanings.map((meaning, i) => (
                                                                        <div key={i} className="ms-3 mt-1">
                                                                            <p className="mb-1"><em>{meaning.vietnamese}</em> - {meaning.definition}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </Accordion.Body>
                                                    </Accordion.Item>
                                                ))}
                                            </Accordion>
                                        ) : (
                                            <p className="text-center text-muted">Không có từ nào trong danh sách này</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </div>
                        ) : (
                            // Các danh sách từ vựng
                            vocabLists.length > 0 ? (
                                <ListGroup>
                                    {vocabLists.map((list) => (
                                        <ListGroup.Item
                                            key={list._id}
                                            action
                                            className="d-flex justify-content-between align-items-center"
                                            onClick={() => handleViewListDetail(list)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div>
                                                <strong>{list.name}</strong>
                                                {list.topic && <Badge bg="info" className="ms-2">{list.topic}</Badge>}
                                                {list.description && <p className="text-muted mb-0 small">{list.description}</p>}
                                            </div>
                                            <div className="text-end">
                                                <Badge bg="success" className="me-2">{list.wordCount || 0} từ</Badge>
                                                <small className="text-muted">{formatDate(list.createdAt)}</small>
                                                {loadingListDetail && selectedList?._id === list._id && (
                                                    <Spinner animation="border" size="sm" className="ms-2" />
                                                )}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-center text-muted p-4">Không có danh sách từ vựng</p>
                            )
                        )}
                    </Tab>

                    <Tab eventKey="listening" title="Listening History">
                        {selectedListening ? (
                            // Xem chi tiết bài nghe
                            <div>
                                <Button variant="outline-secondary" size="sm" className="mb-3" onClick={handleBackToListening}>
                                    <FaArrowLeft className="me-1" /> Quay lại danh sách
                                </Button>
                                <Card>
                                    <Card.Header>
                                        <strong>Chi tiết bài nghe</strong>
                                        <Badge bg={selectedListening.score >= 80 ? "success" : selectedListening.score >= 50 ? "warning" : "danger"} className="ms-2">
                                            Score: {selectedListening.score}%
                                        </Badge>
                                        <small className="text-muted ms-2">{formatDate(selectedListening.createdAt)}</small>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <strong>Yêu cầu (Prompt):</strong>
                                            <p className="border p-2 rounded bg-light">
                                                {selectedListening.userText || "Không có yêu cầu"}
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Nội dung bài nghe:</strong>
                                            <div className="border p-3 rounded bg-light" style={{ maxHeight: "400px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                                {selectedListening.originText}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        ) : (
                            // Danh sách bài luyện nghe
                            listeningHistory && listeningHistory.length > 0 ? (
                                <Table hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Text Preview</th>
                                            <th>Prompt</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listeningHistory.map((item) => (
                                            <tr key={item._id}>
                                                <td style={{ maxWidth: "250px" }} className="text-truncate">
                                                    {item.originText}
                                                </td>
                                                <td style={{ maxWidth: "150px" }} className="text-truncate">
                                                    {item.userText || "-"}
                                                </td>
                                                <td>{formatDate(item.createdAt)}</td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleViewListening(item)}
                                                    >
                                                        <FaEye className="me-1" /> Xem
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-center text-muted p-4">No listening history found</p>
                            )
                        )}
                    </Tab>

                    <Tab eventKey="files" title="Uploaded Files">
                        {files && files.length > 0 ? (
                            <Table hover responsive>
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Type</th>
                                        <th>Size</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file) => (
                                        <tr key={file._id}>
                                            <td style={{ maxWidth: "200px" }} className="text-truncate" title={file.fileName}>
                                                {file.fileName}
                                            </td>
                                            <td>{file.fileType}</td>
                                            <td>{(file.fileSize / 1024).toFixed(2)} KB</td>
                                            <td>{formatDate(file.createdAt)}</td>
                                            <td>
                                                <a
                                                    href={file.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    View File 🔗
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted p-4">No files found (Feature coming soon)</p>
                        )}
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

export default UserDetailModal;
