App.js
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JigsawPuzzle } from 'react-jigsaw-puzzle'
import 'react-jigsaw-puzzle/lib/jigsaw-puzzle.css'
import './App.css'

// CHANGE THIS TO NJ'S PHOTO LINK
const NJ_PHOTO = "./nj.jpg"
// BIRTHDAY WISHES FOR DAJI 🩵❄️🧡🧿
const BIRTHDAY_WISHES = [
  "HAPPY BIRTHDAY DAJI!! 🩵❄️🎂 Hope your special day is as amazing as you are!",
  "Wishing you the happiest birthday, Daji! 🧡🧿 May all your dreams come true this year!",
  "Many many happy returns of the day, Daji! 🧡🧿 Have a blast and eat lots of cake!",
  "Happy Birthday Daji!! 🩵❄️🎉 Sending you lots of love, laughter and good luck today!",
  "It’s your day, Daji! 🧡🧿 Happy Birthday!! May this year bring you endless happiness!"
]
  
export default function App() {
  const [page, setPage] = useState(1)
  const [permissionClicks, setPermissionClicks] = useState(0)
  const [shaken, setShaken] = useState(false)
  const [balloonsPopped, setBalloonsPopped] = useState(0)
  const [knifeCaught, setKnifeCaught] = useState(false)
  const [candleBlown, setCandleBlown] = useState(false)

  useEffect(() => {
    if (page!== 3) return
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity
      if (Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z) > 25) {
        setShaken(true)
        navigator.vibrate?.(200)
      }
    }
    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [page])

  const startBlowing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const checkVolume = () => {
        analyser.getByteFrequencyData(data)
        const volume = data.reduce((a, b) => a + b) / data.length
        if (volume > 50) {
          setCandleBlown(true)
          stream.getTracks().forEach(track => track.stop())
        } else if (!candleBlown) {
          requestAnimationFrame(checkVolume)
        }
      }
      checkVolume()
    } catch {}
  }

  const TOTAL_BALLOONS = 5
  const PERMISSIONS_NEEDED = 17

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {page === 1 && (
          <motion.div key="p1" className="page" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.h1 initial={{y:-50}} animate={{y:0}}>Happiest Birthday dear 🥳🥳</motion.h1>
            <button onClick={() => setPage(2)}>Start the chaos →</button>
          </motion.div>
        )}

        {page === 2 && (
          <motion.div key="p2" className="page">
            <h2>Access Denied</h2>
            <p>You need {PERMISSIONS_NEEDED - permissionClicks} more permissions to continue 😈</p>
            <motion.button whileTap={{scale: 0.9}} onClick={() => {
                setPermissionClicks(c => c + 1)
                if (permissionClicks >= PERMISSIONS_NEEDED - 1) setTimeout(() => setPage(3), 500)
              }}>
              {permissionClicks >= PERMISSIONS_NEEDED - 1? "Granted!" : "Grant Permission"}
            </motion.button>
          </motion.div>
        )}

        {page === 3 && (
          <motion.div key="p3" className="page">
            <h2>🌳 Shake your mobile</h2>
            {!shaken? <p>Shake hard to drop the balloons!</p> : <p>Pop all {TOTAL_BALLOONS} balloons! {balloonsPopped}/{TOTAL_BALLOONS}</p>}
            {shaken && [...Array(TOTAL_BALLOONS)].map((_, i) => (
              <motion.div key={i} className="balloon" initial={{ y: -100, x: `${10 + i * 18}%` }}
                animate={{ y: '110vh' }} transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                onClick={() => setBalloonsPopped(p => p + 1)} style={{ display: balloonsPopped > i? 'none' : 'block' }}>
                🎈</motion.div>
            ))}
            {balloonsPopped >= TOTAL_BALLOONS && (
              <motion.div initial={{scale:0}} animate={{scale:1}} className="wish-popup">
                <h3>Surprise! 🎉</h3>
                <p>You make every day brighter. Happiest Birthday NJ!</p>
                <button onClick={() => setPage(4)}>Next Challenge →</button>
              </motion.div>
            )}
          </motion.div>
        )}

        {page === 4 && (
          <motion.div key="p4" className="page">
            <h2>Solve YOU 😃</h2>
            <p>Drag the pieces to complete your photo</p>
            <JigsawPuzzle imageSrc={NJ_PHOTO} rows={3} columns={3} onSolved={() => setTimeout(() => setPage(5), 1500)} />
          </motion.div>
        )}

        {page === 5 && (
          <motion.div key="p5" className="page">
            <h2>🎂 Make a wish!</h2>
            {!candleBlown? (
              <>
                <motion.div className="candle" animate={{scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:1}}>🕯️</motion.div>
                <p>Blow into your mic to extinguish</p>
                <button onClick={startBlowing}>Enable Mic</button>
                <button onClick={() => setCandleBlown(true)}>Can't blow? Tap here</button>
              </>
            ) : (
              <>
                <h3>Now catch the knife! 🔪</h3>
                <p>Drag it before it falls</p>
                {!knifeCaught && (
                  <motion.div className="knife" drag dragMomentum={false} initial={{ y: -100, x: '50%' }}
                    animate={{ y: '110vh' }} transition={{ duration: 2.5, repeat: Infinity }}
                    onDragStart={() => setKnifeCaught(true)}>🔪</motion.div>
                )}
                {knifeCaught && <button onClick={() => setPage(6)}>Cut the cake! 🎂</button>}
              </>
            )}
          </motion.div>
        )}

        {page === 6 && (
          <motion.div key="p6" className="page">
            <h1>Thank you and sorry for troubling you 😁😃</h1>
            <p style={{marginTop: 40, fontSize: '1.5rem'}}>Yours Hopal</p>
            <button onClick={() => setPage(1)}>Play Again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
