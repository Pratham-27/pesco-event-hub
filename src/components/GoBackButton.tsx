import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const GoBackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(-1)}
      className="mb-4 hover:bg-accent/10"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Go Back
    </Button>
  );
};

export default GoBackButton;
