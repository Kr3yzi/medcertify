import React from "react";
import api from "../../api";

const ApiTestButton = () => {
  const handleTest = async () => {
    try {
      const res = await api.get("/generate-nonce");
      console.log("API Response:", res.data);
      alert("Success! Check console for response.");
    } catch (err) {
      console.error("API Error:", err);
      alert("Error! Check console for details.");
    }
  };

  return (
    <button
      onClick={handleTest}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Test /generate-nonce
    </button>
  );
};

export default ApiTestButton;