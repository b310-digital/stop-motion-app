import { useEffect, useRef, useState } from 'react'
import styles from './Countdown.module.css'

interface CountdownProps {
  from: number
  onComplete: () => void
}

export default function Countdown({ from, onComplete }: CountdownProps) {
  const [counter, setCounter] = useState<number>(from)
  // React's "adjusting state on prop change" pattern: reset the counter
  // mid-render when `from` changes, avoiding the extra render an effect
  // would cause. https://react.dev/learn/you-might-not-need-an-effect
  const [prevFrom, setPrevFrom] = useState(from)
  if (prevFrom !== from) {
    setPrevFrom(from)
    setCounter(from)
  }

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const interval = window.setInterval(() => {
      // Pure updater: decrement, clamp at 0. React 19 invokes updaters twice
      // in dev to detect impurity, so the boundary side-effect must live in
      // an effect, not here.
      setCounter((c) => (c > 0 ? c - 1 : c))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [from])

  useEffect(() => {
    if (counter === 0) {
      onCompleteRef.current()
    }
  }, [counter])

  if (counter === 0) return null
  return (
    <div className={styles.container}>
      <span className={styles.counter}>{counter}</span>
    </div>
  )
}
