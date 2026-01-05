// frontend/src/components/chat/RolePlaySelector.jsx
import { useDispatch, useSelector } from "react-redux";
import { Dropdown } from "react-bootstrap";
import { FaTheaterMasks } from "react-icons/fa";
import { setRolePlay } from "../../redux/slices/chatSlice";
import { ROLE_PLAY_OPTIONS } from "../../utils/constants";
import { toast } from "react-toastify";

const RolePlaySelector = () => {
  const dispatch = useDispatch();
  const { rolePlay, messages } = useSelector((state) => state.chat);

  const handleSelect = (value) => {
    if (messages.length > 0) {
      if (!window.confirm("Changing role play will clear current conversation. Continue?")) {
        return;
      }
    }
    
    dispatch(setRolePlay(value));
    toast.info(`Role play mode: ${ROLE_PLAY_OPTIONS.find(r => r.value === value)?.label}`);
  };

  const currentRole = ROLE_PLAY_OPTIONS.find(r => r.value === rolePlay);

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" size="sm">
        <FaTheaterMasks className="me-2" />
        {currentRole ? currentRole.label : "Select Role Play"}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => handleSelect(null)}
          active={!rolePlay}
        >
          🗣️ General Chat
        </Dropdown.Item>
        <Dropdown.Divider />
        {ROLE_PLAY_OPTIONS.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={() => handleSelect(option.value)}
            active={rolePlay === option.value}
          >
            <div>
              <strong>{option.label}</strong>
              <br />
              <small className="text-muted">{option.description}</small>
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default RolePlaySelector;
