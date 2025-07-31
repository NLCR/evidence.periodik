import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from 'react'
import { TMe } from '../../../../schema/user'
import { TUpdatableVolume } from '../../../../api/volume'
import useVolumeManagementActions from '../../../../hooks/useVolumeManagementActions'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'

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

  const setVolumeState = useVolumeManagementStore(
    (state) => state.volumeActions.setVolumeState
  )
  const setSpeciemnsState = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )

  useEffect(() => {
    if (volume) {
      setVolumeState({ ...volume.volume, isLoading: false }, false)
      setSpeciemnsState(volume.specimens, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
