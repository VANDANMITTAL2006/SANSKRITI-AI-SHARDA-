import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://heritageai-backend.onrender.com'

export const apiClient = axios.create({
  baseURL: API,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

// Default user for demo
export const DEFAULT_USER = 'demo_user'

// All API functions
export const api = {
  // Monuments
  getNearby: () =>
    apiClient.get('/geo/nearby'),

  checkin: (lat: number, lng: number, userId = DEFAULT_USER) =>
    apiClient.post('/geo/checkin', { lat, lng, user_id: userId }),

  // Chat
  askChat: (question: string, monumentId = '') =>
    apiClient.post('/chat/ask', {
      question, monument_id: monumentId
    }),

  // Recognition
  recognize: (imageB64: string, filename = 'image.jpg', options?: Record<string, unknown>) =>
    apiClient.post('/monument/recognize', {
      image_b64: imageB64,
      filename,
      ...(options || {}),
    }),

  // Quiz
  getQuestions: (monumentId = 'taj-mahal') =>
    apiClient.get(`/game/quiz/questions?monument_id=${monumentId}`),

  // Hunt
  getHuntClue: (userId = DEFAULT_USER) =>
    apiClient.get(`/game/hunt/clue?user_id=${userId}`),

  verifyHunt: (userId = DEFAULT_USER, answerIndex: number, huntId = 'taj-mahal-1') =>
    apiClient.post('/game/hunt/verify', {
      user_id: userId,
      answer_index: answerIndex,
      hunt_id: huntId
    }),

  // XP
  awardXP: (userId = DEFAULT_USER, xpDelta: number, eventType = '') =>
    apiClient.post('/game/xp', {
      user_id: userId,
      xp_delta: xpDelta,
      event_type: eventType
    }),

  // Leaderboard
  getLeaderboard: () =>
    apiClient.get('/game/leaderboard'),

  // Itinerary
  getItinerary: (monumentId: string, days = 3) =>
    apiClient.post('/tourism/itinerary', {
      monument_id: monumentId, days
    }),
}

export default api
