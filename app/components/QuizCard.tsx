'use client'
import { useState } from 'react'

const OPTIONS = ['A', 'B', 'C', 'D']

interface QuizCardProps {
  question: string
  options: string[]
  correctIndex: number
  onNext: (correct: boolean) => void
  userId: string
  monumentId: string
}

export function QuizCard({ question, options, correctIndex, onNext, userId, monumentId }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleAnswer = async (i: number) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === correctIndex) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (apiUrl) {
          await fetch(`${apiUrl}/game/xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              event_type: 'QUIZ_CORRECT',
              monument_id: monumentId,
            }),
          })
        }
      } catch (e) {
        console.log('XP call failed, continuing anyway')
      }
    }
    setTimeout(() => {
      onNext(i === correctIndex)
      setSelected(null)
      setAnswered(false)
    }, 1500)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-xl mx-auto">
      <p className="font-bold text-gray-800 text-lg mb-5">{question}</p>
      {options.map((opt, i) => {
        let style = 'bg-white border-gray-300 text-gray-800'
        if (answered) {
          if (i === correctIndex) style = 'bg-green-100 border-green-500 text-green-800'
          else if (i === selected) style = 'bg-red-100 border-red-400 text-red-800'
        }
        return (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={`block w-full text-left px-4 py-3 mb-2 rounded-xl border-2 font-medium transition-all ${style}`}
          >
            {OPTIONS[i]}. {opt}
          </button>
        )
      })}
    </div>
  )
}