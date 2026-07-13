##AgroMind — Smart Farming Assistant

An AI-powered farm advisory platform that gives farmers crop, soil, pest, and weather recommendations through a multilingual chatbot.

Stack

LayerChoiceCrop recommendationRandom ForestSoil analysisXGBoostPest / disease detectionCNN (image classification)Weather forecastingLSTM (time-series)ChatbotRAG pipeline + Claude API (multilingual)Weather dataOpenWeatherMap API (live)BackendNode.jsFrontendHTML / CSS / JavaScriptAuthSession-based login/signup


Run

bashgit clone https://github.com/<your-username>/agromind.git
cd agromind/backend
npm install
cp .env.example .env               # then add your API keys below
npm start

Open frontend/index.html in a browser (or serve frontend/ with a static server / Live Server).

.env

PORT=5000
OPENWEATHER_API_KEY=your_openweathermap_api_key
CLAUDE_API_KEY=your_claude_api_key
DB_URI=your_database_connection_string
JWT_SECRET=your_jwt_secret

Design notes


Four independent models, one dashboard. Crop, soil, pest, and weather each use the model best suited to their data shape — tabular (Random Forest, XGBoost), image (CNN), and sequential (LSTM) — rather than forcing one architecture to cover all four.
RAG over a plain LLM call. The chatbot retrieves relevant agricultural context before generating a response, keeping answers grounded in domain-specific knowledge instead of the model's general priors.
Multilingual by design. Farmers query in their regional language; the chatbot responds in kind.
Live weather, not static. Forecasts blend the LSTM model's trend prediction with real-time OpenWeatherMap data rather than relying on historical patterns alone.
AI insight cards. The dashboard surfaces model outputs as short, Claude-generated natural-language cards instead of raw numbers, so recommendations are immediately actionable.
