import { Howl } from 'howler'
import { useCallback, useRef } from 'react'

const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  collect: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
}

export function useSound() {
  const soundsRef = useRef<Record<string, Howl>>({})

  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    if (!soundsRef.current[type]) {
      soundsRef.current[type] = new Howl({
        src: [SOUNDS[type]],
        volume: 0.5
      })
    }
    soundsRef.current[type].play()
  }, [])

  return {
    playCorrect: () => playSound('correct'),
    playWrong: () => playSound('wrong'),
    playClick: () => playSound('click'),
    playWin: () => playSound('win'),
    playCollect: () => playSound('collect')
  }
}
