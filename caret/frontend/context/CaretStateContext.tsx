// Caret 전용 상태 관리
import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Persona } from '../../../src/shared/types'

interface CaretState {
  persona?: Persona
  templateCharacters: any[]
  selectedPersonaId?: string
  isLoading: boolean
  error?: string
}

interface CaretAction {
  type: string
  payload?: any
}

const initialState: CaretState = {
  templateCharacters: [],
  isLoading: false
}

function caretReducer(state: CaretState, action: CaretAction): CaretState {
  switch (action.type) {
    case 'SET_PERSONA':
      return { ...state, persona: action.payload }
    case 'SET_TEMPLATE_CHARACTERS':
      return { ...state, templateCharacters: action.payload }
    case 'SET_SELECTED_PERSONA_ID':
      return { ...state, selectedPersonaId: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

const CaretStateContext = createContext<{
  state: CaretState
  dispatch: React.Dispatch<CaretAction>
} | undefined>(undefined)

export const CaretStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(caretReducer, initialState)

  return (
    <CaretStateContext.Provider value={{ state, dispatch }}>
      {children}
    </CaretStateContext.Provider>
  )
}

export const useCaretState = () => {
  const context = useContext(CaretStateContext)
  if (context === undefined) {
    throw new Error('useCaretState must be used within a CaretStateProvider')
  }
  return context
} 