"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, FlaskRoundIcon as Flask, Trophy, Landmark, Film, Clock, Star, RotateCcw, Home, Crown } from 'lucide-react'
import { triviaData } from "./trivia-data"

type Category = "general" | "science" | "sports" | "history" | "popculture"
type GameState = "home" | "quiz" | "results" | "leaderboard"

interface Question {
  questionText: string
  options: string[]
  correctAnswer: number
  category: string
}

interface LeaderboardEntry {
  username: string
  score: number
  category: string
  date: string
}

const categoryIcons = {
  general: Brain,
  science: Flask,
  sports: Trophy,
  history: Landmark,
  popculture: Film
}

const categoryNames = {
  general: "🧠 General Knowledge",
  science: "🔬 Science",
  sports: "⚽ Sports",
  history: "🏛 History",
  popculture: "🎬 Pop Culture"
}

const categoryColors = {
  general: "bg-purple-500",
  science: "bg-green-500",
  sports: "bg-blue-500",
  history: "bg-amber-500",
  popculture: "bg-pink-500"
}

export default function TriviaGame() {
  const [gameState, setGameState] = useState<GameState>("home")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [username, setUsername] = useState("")

  // Load leaderboard from localStorage
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem("triviaLeaderboard")
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard))
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (gameState === "quiz" && timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showFeedback) {
      handleAnswerSelect(-1) // Time's up, wrong answer
    }
  }, [timeLeft, gameState, showFeedback])

  const startQuiz = (category: Category) => {
    setSelectedCategory(category)
    setQuestions(triviaData[category])
    setCurrentQuestionIndex(0)
    setScore(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setGameState("quiz")
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    
    setSelectedAnswer(answerIndex)
    setShowFeedback(true)
    
    const currentQuestion = questions[currentQuestionIndex]
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setTimeLeft(15)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        setGameState("results")
      }
    }, 2000)
  }

  const saveScore = () => {
    if (!username.trim()) return
    
    const newEntry: LeaderboardEntry = {
      username: username.trim(),
      score,
      category: categoryNames[selectedCategory!],
      date: new Date().toLocaleDateString()
    }
    
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    
    setLeaderboard(updatedLeaderboard)
    localStorage.setItem("triviaLeaderboard", JSON.stringify(updatedLeaderboard))
    setGameState("leaderboard")
  }

  const resetGame = () => {
    setGameState("home")
    setSelectedCategory(null)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setUsername("")
  }

  if (gameState === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🧩 Trivia Master
            </h1>
            <p className="text-lg text-gray-600">Test your knowledge across 5 exciting categories!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.entries(categoryNames).map(([key, name]) => {
              const category = key as Category
              const Icon = categoryIcons[category]
              return (
                <Card key={category} className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${categoryColors[category]} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => startQuiz(category)}
                      className="w-full"
                      size="lg"
                    >
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setGameState("leaderboard")}
              className="gap-2"
            >
              <Crown className="w-4 h-4" />
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "quiz" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Badge variant="secondary" className="text-sm">
              {categoryNames[selectedCategory!]}
            </Badge>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className={`font-semibold ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md"
                  
                  if (showFeedback) {
                    if (index === currentQuestion.correctAnswer) {
                      buttonClass += " bg-green-100 border-green-500 text-green-800"
                    } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                      buttonClass += " bg-red-100 border-red-500 text-red-800"
                    } else {
                      buttonClass += " bg-gray-50 border-gray-200 text-gray-500"
                    }
                  } else {
                    buttonClass += " bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={buttonClass}
                      disabled={showFeedback}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          {showFeedback && (
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? '🎉 Correct!' : '❌ Wrong!'}
              </div>
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <div className="text-gray-600 mt-2">
                  The correct answer was: {currentQuestion.options[currentQuestion.correctAnswer]}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === "results") {
    const percentage = Math.round((score / questions.length) * 100)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : percentage >= 40 ? '👍' : '😅'}
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-3xl font-bold text-purple-600">{score}/{questions.length}</div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            
            <div>
              <div className="text-2xl font-semibold">{percentage}%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter your name for leaderboard"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-lg"
                maxLength={20}
              />
              <Button onClick={saveScore} className="w-full" disabled={!username.trim()}>
                Save Score
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetGame} className="flex-1 gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button onClick={() => startQuiz(selectedCategory!)} className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "leaderboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-gray-600">Top 10 Trivia Masters</p>
          </div>

          <Card>
            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No scores yet. Be the first to play!
                </div>
              ) : (
                <div className="divide-y">
                  {leaderboard.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{entry.username}</div>
                          <div className="text-sm text-gray-500">{entry.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{entry.score}/10</div>
                        <div className="text-sm text-gray-500">{entry.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button onClick={resetGame} className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
