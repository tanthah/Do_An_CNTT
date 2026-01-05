// frontend/src/pages/ListeningPage.jsx
import { useState, useRef, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
    Spinner,
    Badge,
} from "react-bootstrap";
import {
    FaVolumeUp,
    FaRedo,
    FaInfoCircle,
    FaRobot,
    FaPause,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as listeningService from "../services/listeningService";
import "../styles/Listening.css";

const ListeningPage = () => {
    // States
    const [practiceText, setPracticeText] = useState("");
    const [sampleAudioUrl, setSampleAudioUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // State nội dung AI
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiContent, setAiContent] = useState(null);
    const [aiAudioUrl, setAiAudioUrl] = useState(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Refs
    const sampleAudioRef = useRef(null);
    const aiAudioRef = useRef(null);

    // Cleanup TTS on unmount or refresh
    useEffect(() => {
        const cleanup = async () => {
            try {
                await listeningService.cleanupTTS();
            } catch (error) {
                console.error("Cleanup TTS error:", error);
            }
        };

        // Handle page refresh/close
        const handleBeforeUnload = () => {
            cleanup();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            cleanup();
        };
    }, []);

    // Các câu mẫu để luyện tập
    const sampleSentences = [
        "Hello, how are you today?",
        "I love learning English every day.",
        "The weather is beautiful this morning.",
        "Could you please help me with this?",
        "I am going to the library to study.",
        "Thank you very much for your help.",
        "What time does the meeting start?",
        "She speaks English very fluently.",
        "Learning a new language opens many doors.",
        "Practice makes perfect in everything we do.",
    ];

    // Chọn câu mẫu ngẫu nhiên
    const selectRandomSentence = () => {
        const randomIndex = Math.floor(Math.random() * sampleSentences.length);
        setPracticeText(sampleSentences[randomIndex]);
        setSampleAudioUrl(null);
    };

    // Tạo âm thanh mẫu (TTS)
    const handleGenerateSample = async () => {
        if (!practiceText.trim()) {
            toast.warning("Vui lòng nhập câu để luyện nghe");
            return;
        }

        setIsGenerating(true);

        try {
            const response = await listeningService.createListening(practiceText.trim());

            if (response.data.success) {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const baseUrl = apiUrl.replace(/\/api\/?$/, "");
                const audioUrl = baseUrl + response.data.audioUrl;
                setSampleAudioUrl(audioUrl);
                toast.success("Đã tạo bài nghe!");

                // Tự động phát mẫu
                setTimeout(() => {
                    playSampleAudio();
                }, 500);
            }
        } catch (error) {
            console.error("Generate sample error:", error);
            toast.error("Không thể tạo bài nghe. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Tạo nội dung AI
    const handleGenerateAIContent = async () => {
        if (!aiPrompt.trim()) {
            toast.warning("Vui lòng nhập yêu cầu");
            return;
        }

        setIsGeneratingAI(true);
        setAiContent(null);
        setAiAudioUrl(null);

        try {
            const response = await listeningService.generateAIContent(aiPrompt.trim());

            if (response.data.success) {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const baseUrl = apiUrl.replace(/\/api\/?$/, "");
                setAiContent(response.data.content);
                setAiAudioUrl(baseUrl + response.data.audioUrl);
                toast.success("Đã tạo nội dung!");
            }
        } catch (error) {
            console.error("Generate AI content error:", error);
            toast.error("Không thể tạo nội dung. Vui lòng thử lại.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Phát âm thanh mẫu
    const playSampleAudio = () => {
        if (sampleAudioRef.current) {
            sampleAudioRef.current.play();
            setIsPlaying(true);
        }
    };

    // Phát âm thanh AI
    const playAIAudio = () => {
        if (aiAudioRef.current) {
            aiAudioRef.current.play();
            setIsPlaying(true);
        }
    };

    // Tạm dừng âm thanh
    const pauseAudio = (audioRef) => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    // Xử lý khi âm thanh kết thúc
    const handleAudioEnded = () => {
        setIsPlaying(false);
    };



    return (
        <Container className="listening-page py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <h2>🎧 Luyện Nghe Tiếng Anh</h2>
                    <p className="text-muted">
                        Nghe và luyện tập với câu mẫu hoặc nội dung AI tạo theo chủ đề!
                    </p>
                </Col>
            </Row>

            {/* Phần 1: Luyện tập với văn bản tùy chỉnh */}
            <Row className="mb-4">
                <Col lg={8}>
                    <Card className="text-input-section">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">📝 Nhập câu luyện nghe</h5>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={selectRandomSentence}
                            >
                                <FaRedo className="me-1" /> Câu ngẫu nhiên
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Nhập câu tiếng Anh bạn muốn nghe..."
                                value={practiceText}
                                onChange={(e) => setPracticeText(e.target.value)}
                                disabled={isGenerating}
                            />
                            <div className="mt-3 d-flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={handleGenerateSample}
                                    disabled={!practiceText.trim() || isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Spinner size="sm" animation="border" className="me-2" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <FaVolumeUp className="me-2" />
                                            Tạo bài nghe
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="h-100">
                        <Card.Header>
                            <h6 className="mb-0">💡 Hướng dẫn</h6>
                        </Card.Header>
                        <Card.Body>
                            <ol className="mb-0 ps-3">
                                <li className="mb-2">Nhập câu muốn luyện nghe</li>
                                <li className="mb-2">Nhấn "Tạo bài nghe" để nghe AI đọc</li>
                                <li className="mb-2">Hoặc yêu cầu AI tạo nội dung theo chủ đề</li>
                                <li className="mb-2">Luyện tập mỗi ngày để cải thiện!</li>
                            </ol>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Trình phát âm thanh mẫu */}
            {sampleAudioUrl && (
                <Row className="mb-4">
                    <Col>
                        <Card className="sample-audio-card">
                            <Card.Header>
                                <h5 className="mb-0">🔊 Bài nghe</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="sample-text-display-simple mb-4">
                                    {practiceText.split('\n').map((line, idx) => (
                                        <p key={idx}>{line || '\u00A0'}</p>
                                    ))}
                                </div>

                                <audio
                                    ref={sampleAudioRef}
                                    src={sampleAudioUrl}
                                    onEnded={handleAudioEnded}
                                />

                                <div className="d-flex justify-content-center gap-3">
                                    <Button
                                        variant="primary"
                                        className={`audio-player-btn ${isPlaying ? 'playing' : ''}`}
                                        onClick={() => isPlaying ? pauseAudio(sampleAudioRef) : playSampleAudio()}
                                    >
                                        {isPlaying ? <FaPause /> : <FaVolumeUp />}
                                        {isPlaying ? " Tạm dừng" : " Nghe"}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Phần 2: Tạo nội dung AI */}
            <Row className="mb-4">
                <Col>
                    <Card className="ai-input-section">
                        <Card.Header className="bg-gradient-ai">
                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                <FaRobot /> Tạo nội dung với AI
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Nhập chủ đề hoặc yêu cầu của bạn:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Ví dụ: Tạo đoạn văn về du lịch Việt Nam, hoặc: Hội thoại đặt phòng khách sạn..."
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    disabled={isGeneratingAI}
                                />
                            </Form.Group>

                            <Button
                                variant="success"
                                onClick={handleGenerateAIContent}
                                disabled={!aiPrompt.trim() || isGeneratingAI}
                            >
                                {isGeneratingAI ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <FaRobot className="me-2" />
                                        Tạo nội dung
                                    </>
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Hiển thị nội dung AI tạo */}
            {aiContent && (
                <Row className="mb-4">
                    <Col>
                        <Card className="ai-content-card">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">📝 Nội dung AI tạo</h5>
                                <Badge bg="success">AI Generated</Badge>
                            </Card.Header>
                            <Card.Body>
                                <div className="ai-content-display">
                                    {aiContent.replace(/\\n/g, '\n').split('\n').map((line, idx) => (
                                        <p key={idx}>{line || '\u00A0'}</p>
                                    ))}
                                </div>

                                <audio
                                    ref={aiAudioRef}
                                    src={aiAudioUrl}
                                    onEnded={handleAudioEnded}
                                />

                                <div className="d-flex justify-content-center gap-3 mt-4">
                                    <Button
                                        variant="primary"
                                        className="audio-player-btn"
                                        onClick={() => isPlaying ? pauseAudio(aiAudioRef) : playAIAudio()}
                                    >
                                        {isPlaying ? <FaPause /> : <FaVolumeUp />}
                                        {isPlaying ? " Tạm dừng" : " Nghe AI đọc"}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setAiContent(null);
                                            setAiAudioUrl(null);
                                        }}
                                    >
                                        <FaRedo className="me-1" /> Tạo mới
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Mẹo */}
            <Row>
                <Col>
                    <Alert variant="info" className="d-flex align-items-start gap-3">
                        <FaInfoCircle size={24} className="mt-1 flex-shrink-0" />
                        <div>
                            <strong>Mẹo luyện nghe:</strong>
                            <ul className="mb-0 mt-2">
                                <li>Nghe nhiều lần để quen với cách phát âm</li>
                                <li>Thử viết lại những gì bạn nghe được</li>
                                <li>Tạo nội dung AI theo các chủ đề bạn quan tâm</li>
                                <li>Luyện tập mỗi ngày để cải thiện kỹ năng nghe!</li>
                            </ul>
                        </div>
                    </Alert>
                </Col>
            </Row>
        </Container>
    );
};

export default ListeningPage;
