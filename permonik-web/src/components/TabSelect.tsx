import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

type TOption<T> = { label: string; value: T }

type Props<T> = {
  options: TOption<T>[]
  selectedItem: T
  setSelectedItem: (value: T) => void
  onSelectCallback?: (value: T) => void
}

export function TabSelect<T>({
  options,
  selectedItem,
  setSelectedItem,
  onSelectCallback = undefined,
}: Props<T>) {
  return (
    <>
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
        {options.map((option) => (
          <Button
            key={option.value as string}
            type="button"
            sx={{
              display: 'inline-flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              borderRadius: '2px',
              py: '8px',
              fontSize: '0.8rem',
              fontWeight: 400,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              color: selectedItem === option.value ? 'white' : 'primary.main',
              backgroundColor:
                selectedItem === option.value ? 'primary.main' : 'white',
              '&:disabled': {
                pointerEvents: 'none',
                opacity: 0.5,
              },
              '&:hover': {
                backgroundColor:
                  selectedItem === option.value ? 'primary.dark' : 'grey.100',
              },
            }}
            onClick={() => {
              if (option.value !== selectedItem) {
                setSelectedItem(option.value)
                onSelectCallback?.(option.value)
              }
            }}
          >
            {option.label}
          </Button>
        ))}
      </Box>
    </>
  )
}
