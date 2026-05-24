import { describe, it, expect } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useEffect, type ReactNode } from 'react'
import ToastProvider from '../components/ToastProvider'
import AnimatorProvider from '../components/AnimatorProvider'
import { useAnimator } from './useAnimator'
import { useAnimatorStore } from './useAnimatorStore'
import { CameraStatus } from '@enums/camera-status.enum'
import type { AnimatorService } from '../services/animator-service'

interface ProbeProps {
  onService?: (service: AnimatorService) => void
}

function Probe({ onService }: ProbeProps) {
  const service = useAnimator()
  const store = useAnimatorStore()
  useEffect(() => {
    onService?.(service)
  }, [service, onService])
  return (
    <div>
      <span data-testid="frames">{store.frames.length}</span>
      <span data-testid="rate">{store.frameRate}</span>
      <span data-testid="playing">{String(store.isAnimatorPlaying)}</span>
      <span data-testid="status">{store.cameraStatus}</span>
      <span data-testid="rotated">{String(store.cameraIsRotated)}</span>
      <span data-testid="cameras">{store.cameras.length}</span>
    </div>
  )
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AnimatorProvider>{children}</AnimatorProvider>
    </ToastProvider>
  )
}

const mountProbe = () => {
  let captured: AnimatorService | undefined
  render(
    <Wrapper>
      <Probe onService={(svc) => { captured = svc }} />
    </Wrapper>,
  )
  if (!captured) {
    throw new Error('AnimatorService never published through onService')
  }
  return captured
}

describe('useAnimatorStore', () => {
  it('exposes initial snapshot for every bridged subject', () => {
    mountProbe()
    expect(screen.getByTestId('frames').textContent).toBe('0')
    expect(screen.getByTestId('rate').textContent).toBe('6')
    expect(screen.getByTestId('playing').textContent).toBe('false')
    expect(screen.getByTestId('status').textContent).toBe(CameraStatus.notStarted)
    expect(screen.getByTestId('rotated').textContent).toBe('false')
    expect(screen.getByTestId('cameras').textContent).toBe('0')
  })

  it('re-renders when frames$ pushes a new value', () => {
    const service = mountProbe()
    act(() => {
      service.frames$.next([new Image(), new Image()])
    })
    expect(screen.getByTestId('frames').textContent).toBe('2')
  })

  it('re-renders when frameRate$ on the animator changes', () => {
    const service = mountProbe()
    act(() => {
      service.animator.setFramerate(24)
    })
    expect(screen.getByTestId('rate').textContent).toBe('24')
  })

  it('re-renders when isAnimatorPlaying$ flips', () => {
    const service = mountProbe()
    act(() => {
      service.animator.isAnimatorPlaying$.next(true)
    })
    expect(screen.getByTestId('playing').textContent).toBe('true')
  })

  it('re-renders when cameraStatus$ updates', () => {
    const service = mountProbe()
    act(() => {
      service.cameraStatus$.next(CameraStatus.isStreaming)
    })
    expect(screen.getByTestId('status').textContent).toBe(CameraStatus.isStreaming)
  })

  it('re-renders when cameraIsRotated$ flips', () => {
    const service = mountProbe()
    act(() => {
      service.rotateCamera()
    })
    expect(screen.getByTestId('rotated').textContent).toBe('true')
  })
})
