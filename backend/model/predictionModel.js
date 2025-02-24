const axios = require('axios');

const predictionModel = async (featuresList) => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/predict", { data: featuresList });
    return response.data;
  } catch (error) {
    console.error("❌ Error en la predicción con Flask:", error);
    throw error;
  }
};

module.exports = predictionModel;
