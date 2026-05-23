import { useNavigate } from "react-router-dom";

export default function BackButton({ fallback = "/login" }) {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallback);
  }

  return (
    <button className="back-button" type="button" onClick={handleBack}>
      Voltar
    </button>
  );
}
