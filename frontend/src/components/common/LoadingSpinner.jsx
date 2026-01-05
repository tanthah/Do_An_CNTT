// frontend/src/components/common/LoadingSpinner.jsx
import { Spinner } from "react-bootstrap";

const LoadingSpinner = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="text-center">
        <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;