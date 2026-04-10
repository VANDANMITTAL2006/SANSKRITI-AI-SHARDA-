'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Vapi from '@vapi-ai/web'
import { useLang } from '@/lib/languageContext'

interface Message {
  role: 'user' | 'assistant' | 'zone'
  text: string
  timestamp: number
  zoneName?: string
}

interface ZoneNarrationPayload {
  name: string
  arrival_fact: string
  direction_hint: string
  mini_fact: string
  local_belief?: string
  monumentId: string
}

const MONUMENT_NAME_BY_ID: Record<string, string> = {
  'taj-mahal': 'Taj Mahal',
  'red-fort': 'Red Fort',
  'qutub-minar': 'Qutub Minar',
  'konark': 'Konark Sun Temple'
}

interface UseVapiReturn {
  isCallActive: boolean
  isListening: boolean
  isSpeaking: boolean
  isLoading: boolean
  transcript: string
  messages: Message[]
  currentZoneName: string | null
  startCall: (zoneName?: string, monumentId?: string) => void
  endCall: () => void
  restartVapiForZone: (zone: ZoneNarrationPayload) => Promise<void>
  error: string | null
  volumeLevel: number
}

function formatUnknownError(err: unknown): string {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message || err.toString()
  if (err && typeof err === 'object') {
    const maybeMessage = (err as { message?: unknown }).message
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage

    try {
      const ownKeys = Object.getOwnPropertyNames(err)
      const entries = ownKeys.map((k) => [k, (err as Record<string, unknown>)[k]])
      return JSON.stringify(Object.fromEntries(entries))
    } catch {
      return '[unserializable error object]'
    }
  }
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

function extractVapiErrorMessage(err: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e: any = err
  const candidates = [
    e?.message,
    e?.error?.message,
    e?.error?.error?.message,
    e?.error?.message?.message,
    e?.error?.error?.error,
    e?.message?.message
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate
  }

  return formatUnknownError(err)
}

function extractVapiStatusCode(err: unknown): number | string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e: any = err
  const candidates = [
    e?.statusCode,
    e?.status,
    e?.error?.statusCode,
    e?.error?.status,
    e?.error?.error?.statusCode,
    e?.error?.error?.status,
    e?.error?.message?.statusCode
  ]

  return candidates.find(v => typeof v === 'number' || typeof v === 'string')
}

function isTransientAssistantForbiddenError(err: unknown): boolean {
  const message = extractVapiErrorMessage(err).toLowerCase()
  const status = extractVapiStatusCode(err)
  const hasTransientAssistantHint =
    message.includes('transient assistant') ||
    message.includes("doesn't allow transient") ||
    message.includes('does not allow transient')
  const forbiddenStatus =
    status === 403 ||
    status === '403' ||
    (typeof status === 'string' && status.toLowerCase() === 'forbidden')

  return hasTransientAssistantHint || (forbiddenStatus && message.includes('assistant'))
}

export function useVapi(): UseVapiReturn {
  const vapiRef = useRef<Vapi | null>(null)
  const { lang } = useLang()
  const lastCallContextRef = useRef<ZoneNarrationPayload | null>(null)
  const lastLangRef = useRef(lang)
  const vapiOpQueueRef = useRef<Promise<void>>(Promise.resolve())

  const isPlaceholderValue = useCallback((value?: string) => {
    if (!value) return true
    const v = value.trim().toLowerCase()
    if (!v) return true
    return (
      v.includes('your-') ||
      v.includes('placeholder') ||
      v.includes('example') ||
      v.includes('voice-id-here') ||
      v.includes('public-key-here')
    )
  }, [])

  const enqueueVapiOperation = useCallback((operation: () => Promise<void>) => {
    const next = vapiOpQueueRef.current
      .catch(() => undefined)
      .then(operation)

    vapiOpQueueRef.current = next
    return next
  }, [])

  const buildSystemPrompt = useCallback((zone: ZoneNarrationPayload, currentLang: string) => {
    const monumentName = MONUMENT_NAME_BY_ID[zone.monumentId] || 'the monument'
    const mythSection = zone.local_belief
      ? `\n\nLOCAL MYTH (mandatory - do not skip): ${zone.local_belief}`
      : ''

    return `
You are a heritage voice guide at ${monumentName}.
The visitor has just arrived at: ${zone.name}

ARRIVAL FACT: ${zone.arrival_fact}
MINI FACT: ${zone.mini_fact}
DIRECTION HINT: ${zone.direction_hint}
${mythSection}

Speak in this exact order:
1. Deliver the arrival fact naturally in 2-3 sentences
2. If a LOCAL MYTH is present above, you MUST say it - introduce it with "But here is what the locals will tell you..." and narrate it in 2-3 sentences as legend, never as fact. NEVER skip this if it exists.
3. End with the direction hint to guide the visitor forward

${currentLang === 'hi' ? 'CRITICAL: Respond entirely in Hindi. All facts, myths, and hints must be in Hindi.' : ''}
`.trim()
  }, [])

  const buildRuntimeAssistantConfig = useCallback((zone: ZoneNarrationPayload) => {
    const systemPrompt = buildSystemPrompt(zone, lang)

    // Default to Vapi-native voices unless explicit ElevenLabs voice IDs are configured.
    const configuredEnglishVoiceId = process.env.NEXT_PUBLIC_VAPI_ENGLISH_VOICE_ID
    const configuredHindiVoiceId = process.env.NEXT_PUBLIC_VAPI_HINDI_VOICE_ID
    const hasExplicit11LabsVoices =
      !isPlaceholderValue(configuredEnglishVoiceId) ||
      !isPlaceholderValue(configuredHindiVoiceId)

    const englishVoiceId = !isPlaceholderValue(configuredEnglishVoiceId)
      ? configuredEnglishVoiceId!
      : 'Leah'
    const hindiVoiceId = !isPlaceholderValue(configuredHindiVoiceId)
      ? configuredHindiVoiceId!
      : 'Neha'

    const voiceConfig = hasExplicit11LabsVoices
      ? (lang === 'hi'
        ? {
            provider: '11labs' as const,
            voiceId: hindiVoiceId,
            model: 'eleven_turbo_v2_5' as const,
            language: 'hi'
          }
        : {
            provider: '11labs' as const,
            voiceId: englishVoiceId,
            model: 'eleven_turbo_v2_5' as const,
            language: 'en'
          })
      : (lang === 'hi'
        ? {
            provider: 'vapi' as const,
            voiceId: 'Neha' as const
          }
        : {
            provider: 'vapi' as const,
            voiceId: 'Leah' as const
          })

    const modelSystemContent = lang === 'hi'
      ? `${systemPrompt}\n\nCRITICAL: You MUST respond only in Hindi. This is non-negotiable.`
      : systemPrompt

    const assistantConfig: any = {
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: modelSystemContent
          }
        ]
      },
      voice: voiceConfig,
      firstMessage: `Welcome to ${zone.name}`
    }

    if (hasExplicit11LabsVoices) {
      assistantConfig.transcriber = {
        provider: 'deepgram' as const,
        model: 'nova-2' as const,
        language: lang === 'hi' ? 'hi' : 'en'
      }
    }

    return assistantConfig
  }, [buildSystemPrompt, isPlaceholderValue, lang])

  const buildFallbackAssistantConfig = useCallback((zone: ZoneNarrationPayload) => {
    const fallbackPrompt = buildSystemPrompt(zone, lang)
    return {
      model: {
        provider: 'openai' as const,
        model: 'gpt-4o-mini' as const,
        messages: [
          {
            role: 'system' as const,
            content: fallbackPrompt
          }
        ]
      },
      voice: lang === 'hi'
        ? { provider: 'vapi' as const, voiceId: 'Neha' as const }
        : { provider: 'vapi' as const, voiceId: 'Leah' as const },
      firstMessage: `Welcome to ${zone.name}`
    }
  }, [buildSystemPrompt, lang])

  const startWithFallback = useCallback(async (vapi: Vapi, zone: ZoneNarrationPayload) => {
    const staticAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
    const transientAssistantBlockedMsg =
      'This Vapi key blocks transient assistants. Set NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local.'

    const tryStartWithAssistantId = async () => {
      if (isPlaceholderValue(staticAssistantId)) return false
      console.log('Starting VAPI with configured assistant ID fallback')
      await vapi.start(staticAssistantId!)
      return true
    }

    // Prefer persistent assistant mode when configured to avoid transient-assistant permission errors.
    const startedWithAssistantId = await tryStartWithAssistantId()
    if (startedWithAssistantId) return

    const primaryConfig = buildRuntimeAssistantConfig(zone)
    try {
      console.log('Starting VAPI with primary config:', JSON.stringify(primaryConfig, null, 2))
      try {
        const result = await vapi.start(primaryConfig)
        console.log('VAPI start result:', JSON.stringify(result, null, 2))
      } catch (e: any) {
        console.warn('VAPI start threw:', extractVapiErrorMessage(e))
        throw e
      }
      return
    } catch (primaryErr) {
      if (isTransientAssistantForbiddenError(primaryErr)) {
        const started = await tryStartWithAssistantId()
        if (started) return
        throw new Error(transientAssistantBlockedMsg)
      }
      console.warn('Primary VAPI start failed:', extractVapiErrorMessage(primaryErr))
    }

    const fallbackConfig = buildFallbackAssistantConfig(zone)
    try {
      console.log('Retrying VAPI start with fallback config:', JSON.stringify(fallbackConfig, null, 2))
      try {
        const result = await vapi.start(fallbackConfig)
        console.log('VAPI start result:', JSON.stringify(result, null, 2))
      } catch (e: any) {
        console.warn('VAPI start threw:', extractVapiErrorMessage(e))
        throw e
      }
    } catch (fallbackErr) {
      if (isTransientAssistantForbiddenError(fallbackErr)) {
        const started = await tryStartWithAssistantId()
        if (started) return
        throw new Error(transientAssistantBlockedMsg)
      }
      const finalError = formatUnknownError(fallbackErr)
      console.warn('Fallback VAPI start failed:', finalError)
      throw new Error(finalError || 'Voice start failed')
    }
  }, [buildFallbackAssistantConfig, buildRuntimeAssistantConfig, isPlaceholderValue])

  const [isCallActive, setIsCallActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentZoneName, setCurrentZoneName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [volumeLevel, setVolumeLevel] = useState(0)

  // Initialize Vapi once
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    if (isPlaceholderValue(publicKey)) {
      setError('Vapi public key is not configured. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env.local')
      return
    }

    const vapi = new Vapi(publicKey)
    vapiRef.current = vapi

    // ── EVENT LISTENERS ──────────────────────────────────

    vapi.on('call-start', () => {
      setIsCallActive(true)
      setIsLoading(false)
      setError(null)
      console.log('Vapi call started')
    })

    vapi.on('call-end', () => {
      setIsCallActive(false)
      setIsListening(false)
      setIsSpeaking(false)
      setIsLoading(false)
      setVolumeLevel(0)
      console.log('Vapi call ended')
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('call-start-progress', (event: any) => {
      console.log('Vapi call-start-progress:', event)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('call-start-failed', (event: any) => {
      const detail = event?.error || event?.stage || event || 'Voice start failed'
      const detailText = extractVapiErrorMessage(detail)
      const detailStatus = extractVapiStatusCode(detail)
      const statusSuffix = detailStatus ? ` (status: ${detailStatus})` : ''
      console.warn(`[Vapi] call-start-failed: ${detailText}${statusSuffix}`)
      setError(detailText || 'Voice start failed')
      setIsLoading(false)
      setIsCallActive(false)
    })

    vapi.on('speech-start', () => {
      setIsSpeaking(true)
      setIsListening(false)
    })

    vapi.on('speech-end', () => {
      setIsSpeaking(false)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('message', (message: any) => {
      // Handle transcript messages
      if (message.type === 'transcript') {
        if (message.transcriptType === 'partial') {
          setTranscript(message.transcript)
        }
        if (message.transcriptType === 'final') {
          setTranscript('')
          if (message.role === 'user' && message.transcript.trim()) {
            setIsListening(false)
            setMessages(prev => [...prev, {
              role: 'user',
              text: message.transcript,
              timestamp: Date.now()
            }])
          }
        }
      }

      // Handle assistant responses
      if (
        message.type === 'transcript' &&
        message.role === 'assistant' &&
        message.transcriptType === 'final' &&
        message.transcript.trim()
      ) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: message.transcript,
          timestamp: Date.now()
        }])
      }

      // Handle conversation updates
      if (message.type === 'conversation-update') {
        const lastMsg = message.conversation?.[message.conversation.length - 1]
        if (lastMsg?.role === 'assistant' && lastMsg?.content) {
          setMessages(prev => {
            const alreadyExists = prev.some(
              m => m.role === 'assistant' &&
                m.text === lastMsg.content &&
                Date.now() - m.timestamp < 3000
            )
            if (alreadyExists) return prev
            return [...prev, {
              role: 'assistant',
              text: lastMsg.content,
              timestamp: Date.now()
            }]
          })
        }
      }
    })

    vapi.on('volume-level', (level: number) => {
      setVolumeLevel(level)
      if (level > 0.02) {
        setIsListening(true)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('error', (err: any) => {
      const message = extractVapiErrorMessage(err)
      const status = extractVapiStatusCode(err)
      const statusSuffix = status ? ` (status: ${status})` : ''
      console.warn(`[Vapi] error: ${message}${statusSuffix}`)

      const errorStr = isTransientAssistantForbiddenError(err)
        ? 'This Vapi key blocks transient assistants. Set NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local.'
        : message || 'Voice connection error. Please try again.'

      setError(errorStr)
      setIsLoading(false)
      setIsCallActive(false)
    })

    return () => {
      vapi.stop()
    }
  }, [isPlaceholderValue])

  // ── START CALL ───────────────────────────────────────────
  const startCall = useCallback((
    zoneName?: string,
    monumentId?: string
  ) => {
    const vapi = vapiRef.current
    if (!vapi) {
      setError('Vapi not initialized')
      return
    }

    setIsLoading(true)
    setError(null)
    const zonePayload: ZoneNarrationPayload = {
      name: zoneName || 'Heritage Explorer',
      arrival_fact: zoneName
        ? `The visitor has arrived at ${zoneName}. Share one concise, vivid heritage insight.`
        : 'The visitor has just opened the heritage guide app and is ready to explore.',
      direction_hint: 'Guide the visitor to ask for the next nearby point of interest.',
      mini_fact: 'Keep the narration concise, warm, and engaging.',
      monumentId: monumentId || 'general'
    }
    lastCallContextRef.current = zonePayload

    void enqueueVapiOperation(async () => {
      try {
        await startWithFallback(vapi, zonePayload)
      } catch (e) {
        const msg = formatUnknownError(e)
        console.warn('VAPI start failed:', msg)
        setError(msg || 'Voice start failed')
        setIsLoading(false)
      }
    })

  }, [enqueueVapiOperation, startWithFallback])

  // Restart active call on language toggle to apply new voice + prompt config.
  useEffect(() => {
    const previousLang = lastLangRef.current
    if (previousLang === lang) return
    lastLangRef.current = lang

    const vapi = vapiRef.current
    if (!vapi || !isCallActive) return

    const zonePayload = lastCallContextRef.current
    if (!zonePayload) return

    setIsLoading(true)
    setError(null)

    void enqueueVapiOperation(async () => {
      try {
        await vapi.stop()
        await new Promise(r => setTimeout(r, 500))
        await startWithFallback(vapi, zonePayload)
      } catch (e) {
        const msg = formatUnknownError(e)
        console.warn('VAPI start failed:', msg)
        setError(msg || 'Voice reconnection failed')
        setIsLoading(false)
      }
    })
  }, [enqueueVapiOperation, isCallActive, lang, startWithFallback])

  // ── END CALL ─────────────────────────────────────────────
  const endCall = useCallback(() => {
    vapiRef.current?.stop()
    setIsCallActive(false)
    setIsListening(false)
    setIsSpeaking(false)
    setIsLoading(false)
    setVolumeLevel(0)
  }, [])

  // ── RESTART VAPI FOR EACH ZONE ─────────────────────────
  const restartVapiForZone = useCallback(async (zone: ZoneNarrationPayload) => {
    const vapi = vapiRef.current
    if (!vapi) {
      setError('Vapi not initialized')
      return
    }

    lastCallContextRef.current = zone
    setCurrentZoneName(zone.name)

    setMessages(prev => [...prev, {
      role: 'zone',
      text: zone.arrival_fact,
      timestamp: Date.now(),
      zoneName: zone.name
    }])

    console.log('Zone myth:', zone.local_belief)
    const assistantConfig = buildRuntimeAssistantConfig(zone)
    console.log('VAPI config:', JSON.stringify(assistantConfig))

    setIsLoading(true)
    setError(null)

    await enqueueVapiOperation(async () => {
      try {
        if (isCallActive) await vapi.stop()
        if (isCallActive) await new Promise(r => setTimeout(r, 500))
        try {
          const result = await startWithFallback(vapi, zone)
          console.log('VAPI start result:', JSON.stringify(result, null, 2))
        } catch (e: any) {
          console.warn('VAPI start threw:', extractVapiErrorMessage(e))
          throw e
        }
      } catch (e) {
        const msg = formatUnknownError(e)
        console.warn('VAPI start failed:', msg)
        setError(msg || 'Voice restart failed')
        setIsLoading(false)
      }
    })
  }, [buildRuntimeAssistantConfig, enqueueVapiOperation, isCallActive, startWithFallback])

  return {
    isCallActive,
    isListening,
    isSpeaking,
    isLoading,
    transcript,
    messages,
    currentZoneName,
    startCall,
    endCall,
    restartVapiForZone,
    error,
    volumeLevel
  }
}
