import { useState, useEffect, useRef } from 'react'

import './memoji.css'

const AvailableEmojis = ['😂', '😍', '🤣', '😊', '😭', '😘', '😅', '😁']

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

const makeEmojiObject = (emojiCharacter) => [
  {
    emoji: emojiCharacter,
    state: 'concealed',
    key: `emoji-${emojiCharacter}-1`,
  },
  {
    emoji: emojiCharacter,
    state: 'concealed',
    key: `emoji-${emojiCharacter}-2`,
  },
]

const isGameEnded = (gridEmojis) =>
  gridEmojis.length > 0 &&
  gridEmojis.every((emojiObj) => emojiObj.state === 'matched')

function EmojiMemory() {
  const [gameState, setGameState] = useState('new')
  const [gridEmojis, setGridEmojis] = useState([])
  const startingTime = useRef()
  const endingTime = useRef()
  const currentlyRevealedEmojis = useRef([])
  const failedAttempts = useRef()
  const onRestartGame = () => {
    setGameState('new')
  }

  const onSquareClick = (emojiKey) => {
    if (gameState === 'new') {
      setGameState('in-progress')
    }

    if (gameState === 'new' || gameState === 'in-progress') {
      const gridEmojisCopy = [...gridEmojis]
      const clickedOnEmoji = gridEmojisCopy.find(
        (emojiObj) => emojiObj.key === emojiKey
      )

      if (clickedOnEmoji.state === 'matched') {
        //* Do nothing!
        return
      }

      if (clickedOnEmoji.state === 'revealed') {
        currentlyRevealedEmojis.current = currentlyRevealedEmojis.current.filter(
          (key) => key !== emojiKey
        )
        clickedOnEmoji.state = 'concealed'
      } else if (clickedOnEmoji.state === 'concealed') {
        if (currentlyRevealedEmojis.current.length === 0) {
          currentlyRevealedEmojis.current.push(clickedOnEmoji.key)
          clickedOnEmoji.state = 'revealed'
        } else {
          const oldestPreviouslyRevealedEmoji = gridEmojisCopy.find(
            (emojiObj) => emojiObj.key === currentlyRevealedEmojis.current[0]
          )

          if (currentlyRevealedEmojis.current.length === 2) {
            oldestPreviouslyRevealedEmoji.state = 'concealed'
            currentlyRevealedEmojis.current = [
              currentlyRevealedEmojis.current[1],
            ]
          }

          if (currentlyRevealedEmojis.current.length === 1) {
            const newestPreviouslyRevealedEmoji = gridEmojisCopy.find(
              (emojiObj) => emojiObj.key === currentlyRevealedEmojis.current[0]
            )
            if (newestPreviouslyRevealedEmoji.emoji === clickedOnEmoji.emoji) {
              newestPreviouslyRevealedEmoji.state = 'matched'
              clickedOnEmoji.state = 'matched'
              currentlyRevealedEmojis.current = []
            } else {
              currentlyRevealedEmojis.current.push(clickedOnEmoji.key)
              clickedOnEmoji.state = 'revealed'
              failedAttempts.current++
            }
          }
        }
      }
      setGridEmojis(gridEmojisCopy)
    }
  }

  useEffect(() => {
    if (gameState === 'new') {
      startingTime.current = new Date()
      failedAttempts.current = 0
      currentlyRevealedEmojis.current = []
      setGridEmojis(shuffle([...AvailableEmojis.flatMap(makeEmojiObject)]))
    } else if (gameState === 'in-progress') {
      startingTime.current = new Date()
      endingTime.current = new Date()
    }
  }, [gameState])

  useEffect(() => {
    if (isGameEnded(gridEmojis)) {
      endingTime.current = new Date()
      setGameState('finished')
    }
  }, [gridEmojis])

  return (
    <>
      <div className="emoji-grid-wrapper">
        <div className="emoji-grid">
          {gameState === 'finished' ? (
            <div className="game-stats">
              You finished the game in{' '}
              {(endingTime.current.getTime() - startingTime.current.getTime()) /
                1000}{' '}
              seconds and had {failedAttempts.current} failed attempts.
            </div>
          ) : null}
          {gridEmojis.map((emojiObj) => (
            <button
              key={emojiObj.key}
              onClick={() => {
                onSquareClick(emojiObj.key)
              }}
              className={`emoji-button${
                emojiObj.state === 'matched' ? ' matched' : ''
              }`}
            >
              {emojiObj.state !== 'concealed' ? emojiObj.emoji : '❓'}
              {emojiObj.state === 'matched' ? (
                <div className="emoji-matched">✅</div>
              ) : null}
            </button>
          ))}
        </div>
      </div>
      {gameState !== 'new' ? (
        <div className="restart-button-wrapper">
          <button onClick={onRestartGame}>RESTART</button>
        </div>
      ) : null}
    </>
  )
}

export default EmojiMemory
