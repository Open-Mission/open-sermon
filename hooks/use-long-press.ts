import { useRef, useCallback } from 'react'

export function useLongPress(
  onLongPress: (e: React.MouseEvent | React.TouchEvent) => void,
  { delay = 500 } = {}
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isCanceledRef = useRef(false)
  const didLongPressRef = useRef(false)

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isCanceledRef.current = false
      didLongPressRef.current = false
      
      timerRef.current = setTimeout(() => {
        if (!isCanceledRef.current) {
          onLongPress(e)
          didLongPressRef.current = true
        }
      }, delay)
    },
    [onLongPress, delay]
  )

  const stop = useCallback(() => {
    isCanceledRef.current = true
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }, [])

  const handleMove = useCallback(() => {
    stop()
  }, [stop])

  const onClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (didLongPressRef.current) {
      e.stopPropagation()
      e.preventDefault()
      didLongPressRef.current = false
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchMove: handleMove,
    onClick,
  }
}
