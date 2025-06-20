import { createContext, useContext, useState, ReactNode } from 'react'

type InputDataEditabilityContextType = {
  disabled: boolean
  locked: boolean
  setDisabled: (value: boolean) => void
  setLocked: (value: boolean) => void
}

const InputDataEditabilityContext = createContext<
  InputDataEditabilityContextType | undefined
>(undefined)

export function InputDataEditabilityContextProvider({
  children,
  disabled: disabledInitial,
  locked: lockedInitial,
}: {
  children: ReactNode
  disabled: boolean
  locked: boolean
}) {
  const [disabled, setDisabled] = useState(disabledInitial)
  const [locked, setLocked] = useState(lockedInitial)

  return (
    <InputDataEditabilityContext.Provider
      value={{ disabled, locked, setDisabled, setLocked }}
    >
      {children}
    </InputDataEditabilityContext.Provider>
  )
}

export function useInputDataEditabilityContext() {
  const context = useContext(InputDataEditabilityContext)
  if (!context)
    throw new Error(
      'useInputDataEditability must be used within InputDataEditabilityContextProvider'
    )
  return context
}
