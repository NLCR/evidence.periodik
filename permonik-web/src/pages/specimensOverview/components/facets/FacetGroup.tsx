import { ChangeEvent, FC } from 'react'
import { useTranslation } from 'react-i18next'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

type TInput = {
  values: string[]
  header: string
  onChange: (value: string[]) => void
  facets: {
    name: string
    displayedName?: string
    count: number
  }[]
  disabled: boolean
}

const FacetGroup: FC<TInput> = ({
  values,
  header,
  facets,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    const newValues = values.includes(newValue)
      ? values.filter((value) => value !== newValue)
      : [...values, newValue]
    onChange(newValues)
  }

  return (
    <Accordion
      disableGutters
      sx={{
        boxShadow: 0,
        margin: 0,
        borderBottom: `1px solid lightGrey`,
        '&:last-child': {
          borderBottom: 0,
        },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          component="span"
          variant="body2"
          sx={{
            marginTop: '10px',
            marginBottom: '5px',
            fontWeight: '700',
          }}
        >
          {header}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {facets.map((f) => (
            <FormControlLabel
              sx={{
                // display: 'flex',
                width: '100%',
                // justifyContent: 'space-between',
                // alignItems: 'start',
                // fontSize: '12px',
                '& .MuiCheckbox-root': {
                  paddingTop: '6px',
                  paddingBottom: '6px',
                },
                '& .MuiFormControlLabel-label': {
                  display: 'block',
                  width: '100%',
                },
              }}
              key={f.name}
              control={
                <Checkbox
                  value={f.name}
                  checked={values.includes(f.name)}
                  onChange={handleChange}
                  disabled={disabled}
                  sx={{
                    // marginTop: 1,
                    // marginBottom: 1,
                    cursor: 'pointer',
                    // width: '100%',
                  }}
                />
              }
              labelPlacement="end"
              label={
                <Box
                  sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    // fontSize: '12px',
                  }}
                >
                  <Typography variant="body2">
                    {f.name.length > 0
                      ? f.displayedName || f.name
                      : t('facet_states.empty')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      marginLeft: '10px',
                    }}
                  >
                    {f.count}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

export default FacetGroup
