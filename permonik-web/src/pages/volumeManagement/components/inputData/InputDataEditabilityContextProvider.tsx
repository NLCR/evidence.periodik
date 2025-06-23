import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { TMe } from '../../../../schema/user'
import { TUpdatableVolume } from '../../../../api/volume'

type InputDataEditabilityContextType = {
  disabled: boolean
  locked: boolean
  setLocked: (value: boolean) => void
}

const InputDataEditabilityContext = createContext<
  InputDataEditabilityContextType | undefined
>(undefined)

export function InputDataEditabilityContextProvider({
  children,
  me,
  volumeId,
  volume,
  locked: lockedInitial,
}: {
  children: ReactNode
  me: TMe
  volumeId: string | undefined
  volume: TUpdatableVolume | null | undefined
  locked: boolean
}) {
  const canEdit = useMemo(
    () =>
      me?.owners?.some((o) => o === volume?.volume?.ownerId) ||
      !volumeId?.length ||
      me?.role === 'super_admin',
    [me, volume?.volume, volumeId?.length]
  )
  const [locked, setLocked] = useState(lockedInitial)

  return (
    <InputDataEditabilityContext.Provider
      value={{ disabled: !canEdit, locked, setLocked }}
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
