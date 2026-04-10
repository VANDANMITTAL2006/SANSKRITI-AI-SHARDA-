import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

export const api = {
  nearby: () => apiClient.get("/geo/nearby"),
  checkIn: (lat: number, lng: number, user_id: string) =>
    apiClient.post("/geo/checkin", { lat, lng, user_id }),
  askChat: (question: string, monument_id: string) =>
    apiClient.post("/chat/ask", { question, monument_id }),
  recognize: (image_b64: string, filename: string) =>
    apiClient.post("/monument/recognize", { image_b64, filename }),
  quizQuestions: (monument_id: string) =>
    apiClient.get("/game/quiz/questions", { params: { monument_id } }),
  huntClue: (user_id: string) =>
    apiClient.get("/game/hunt/clue", { params: { user_id } }),
  huntVerify: (user_id: string, answer_index: number, hunt_id: string) =>
    apiClient.post("/game/hunt/verify", { user_id, answer_index, hunt_id }),
  awardXP: (user_id: string, xp_delta: number, event_type: string) =>
    apiClient.post("/game/xp", { user_id, xp_delta, event_type }),
  leaderboard: () => apiClient.get("/game/leaderboard"),
  itinerary: (monument_id: string, days: number) =>
    apiClient.post("/tourism/itinerary", { monument_id, days }),
  leadCapture: (payload: Record<string, unknown>) =>
    apiClient.post("/leads/capture", payload),
};

export default api;
