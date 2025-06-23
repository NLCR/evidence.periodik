import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { TSpecimenStateButton } from '../../../schema/specimen'

type TOption = { label: string; value: TSpecimenStateButton['id'] }

type Props = {
  label?: string
  options: TOption[]
  selectedItems: TSpecimenStateButton[]
  setSelectedItems: (value: TSpecimenStateButton[]) => void
}

export function FormTabMultiSelect({
  label = undefined,
  options,
  selectedItems,
  setSelectedItems,
}: Props) {
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
        {options.map((option) => {
          const active = !!selectedItems.find((i) => i.id === option.value)
            ?.active

          return (
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
                color: active ? 'white' : 'primary.main',
                backgroundColor: active ? 'primary.main' : 'white',
                '&:disabled': {
                  pointerEvents: 'none',
                  opacity: 0.5,
                },
                '&:hover': {
                  backgroundColor: active ? 'primary.dark' : 'grey.100',
                },
              }}
              onClick={() => {
                let newOptions

                const exists = selectedItems.some(
                  (item) => item.id === option.value
                )
                if (exists) {
                  // Update an existing option
                  newOptions = selectedItems.map((item) =>
                    item.id === option.value
                      ? { ...item, active: !item.active }
                      : item
                  )
                } else {
                  // Add a new option
                  newOptions = [
                    ...selectedItems,
                    { id: option.value, active: true },
                  ]
                }
                setSelectedItems(newOptions)
              }}
            >
              {option.label}
            </Button>
          )
        })}
      </Box>
    </>
  )
}
