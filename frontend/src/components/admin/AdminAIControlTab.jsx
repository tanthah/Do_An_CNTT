// frontend/src/components/admin/AdminAIControlTab.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from "react-bootstrap";
import { FaRobot, FaBan, FaSave, FaExclamationTriangle } from "react-icons/fa";
import { getAIConfigs, updateAIConfig } from "../../services/aiConfigService";
import { toast } from "react-toastify";

const AdminAIControlTab = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [configs, setConfigs] = useState({});

    // State cục bộ để chỉnh sửa
    const [systemPrompt, setSystemPrompt] = useState("");
    const [blockedKeywords, setBlockedKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState("");

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const response = await getAIConfigs();
            if (response.data.success) {
                const configMap = {};
                response.data.configs.forEach(conf => {
                    configMap[conf.key] = conf.value;
                });

                setConfigs(configMap);
                setSystemPrompt(configMap["system_prompt"] || "");
                setBlockedKeywords(configMap["blocked_keywords"] || []);
            }
        } catch (error) {
            toast.error("Failed to load AI configs");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePrompt = async () => {
        setSaving(true);
        try {
            await updateAIConfig("system_prompt", systemPrompt);
            toast.success("System prompt updated successfully!");
        } catch (error) {
            toast.error("Failed to update system prompt");
        } finally {
            setSaving(false);
        }
    };

    const handleAddKeyword = (e) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;

        if (blockedKeywords.some(k => k.toLowerCase() === newKeyword.trim().toLowerCase())) {
            toast.warning("Keyword already exists!");
            return;
        }

        const updatedList = [...blockedKeywords, newKeyword.trim()];
        setBlockedKeywords(updatedList);
        setNewKeyword("");
        saveKeywords(updatedList);
    };

    const handleRemoveKeyword = (keywordToRemove) => {
        const updatedList = blockedKeywords.filter(k => k !== keywordToRemove);
        setBlockedKeywords(updatedList);
        saveKeywords(updatedList);
    };

    const saveKeywords = async (list) => {
        try {
            await updateAIConfig("blocked_keywords", list);
            // Lưu âm thầm hoặc hiển thị toast? Hãy hiển thị toast cho hành động rõ ràng.
            // Hiện tại, cứ lưu đã.
        } catch (error) {
            toast.error("Failed to sync keywords");
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container className="py-2">
            <Alert variant="info" className="mb-4">
                <FaExclamationTriangle className="me-2" />
                <strong>Caution:</strong> Changes here directly affect how the AI behaves for all users.
            </Alert>

            <Row>
                <Col md={7}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-primary text-white d-flex align-items-center">
                            <FaRobot className="me-2" />
                            <h5 className="mb-0">System Prompt Configuration</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Text className="text-muted d-block mb-2">
                                This is the core personality of the AI. It defines what it should and shouldn't do.
                            </Form.Text>
                            <Form.Control
                                as="textarea"
                                rows={12}
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="mb-3 font-monospace"
                                style={{ fontSize: "0.9rem" }}
                            />
                            <div className="d-flex justify-content-end">
                                <Button
                                    variant="primary"
                                    onClick={handleSavePrompt}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : <><FaSave className="me-2" /> Save Prompt</>}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-danger text-white d-flex align-items-center">
                            <FaBan className="me-2" />
                            <h5 className="mb-0">Blocked Keywords</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Text className="text-muted d-block mb-3">
                                If a user's message contains any of these phrases, it will be blocked immediately.
                            </Form.Text>

                            <Form onSubmit={handleAddKeyword} className="mb-3">
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Add keyword (e.g., 'math homework')"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                    />
                                    <Button type="submit" variant="outline-danger">Add</Button>
                                </div>
                            </Form>

                            <div className="d-flex flex-wrap gap-2 mt-3 p-3 bg-light rounded border" style={{ minHeight: "200px", alignContent: "flex-start" }}>
                                {blockedKeywords.length === 0 ? (
                                    <span className="text-muted fst-italic">No blocked keywords yet.</span>
                                ) : (
                                    blockedKeywords.map((keyword, index) => (
                                        <Badge
                                            key={index}
                                            bg="danger"
                                            className="p-2 d-flex align-items-center gap-2"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {keyword}
                                            <span
                                                style={{ cursor: "pointer", opacity: 0.8 }}
                                                onClick={() => handleRemoveKeyword(keyword)}
                                                title="Remove"
                                            >
                                                ×
                                            </span>
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminAIControlTab;
