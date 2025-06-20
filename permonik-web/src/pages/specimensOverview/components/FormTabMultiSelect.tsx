import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useEffect, useState } from 'react'

type TOption = { label: string; value: string }
type TMarkedOption = TOption & {
  active: boolean
}

type Props = {
  label?: string
  options: TOption[]
  selectedItems: string[]
  setSelectedItems: (value: string[]) => void
}

export function FormTabMultiSelect({
  label = undefined,
  options,
  selectedItems,
  setSelectedItems,
}: Props) {
  const [markedOptions, setMarkedOptions] = useState<TMarkedOption[]>(
    options.map((option) => ({
      ...option,
      active: selectedItems.includes(option.value),
    }))
  )

  useEffect(() => {
    if (markedOptions) {
      setSelectedItems(
        markedOptions
          .filter((option) => option.active)
          .map((option) => option.value)
      )
    }
  }, [markedOptions, setSelectedItems])

  return (
    <>
      {label && (
        <Box sx={{ fontWeight: 'bold', my: 1, fontSize: '0.85rem' }}>
          {label}
        </Box>
      )}
      <Box
        sx={{
          display: 'inline-flex',
          gap: '1px',
          cursor: 'pointer',
          width: '100%',
          height: '2.5rem',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.300',
          padding: 0,
        }}
      >
        {markedOptions.map((option) => (
          <Button
            key={option.value.toString()}
            type="button"
            sx={{
              display: 'inline-flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              borderRadius: '2px',
              py: '6px',
              fontSize: '1rem',
              fontWeight: 400,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              color: option.active ? 'white' : 'primary.main',
              backgroundColor: option.active ? 'primary.main' : 'white',
              '&:disabled': {
                pointerEvents: 'none',
                opacity: 0.5,
              },
              '&:hover': {
                backgroundColor: option.active ? 'primary.dark' : 'grey.100',
              },
            }}
            onClick={() => {
              setMarkedOptions(
                markedOptions.map((markedOption) => ({
                  ...markedOption,
                  active:
                    markedOption.value === option.value
                      ? !markedOption.active
                      : markedOption.active,
                }))
              )
            }}
          >
            {option.label}
          </Button>
        ))}
      </Box>
    </>
  )
}
