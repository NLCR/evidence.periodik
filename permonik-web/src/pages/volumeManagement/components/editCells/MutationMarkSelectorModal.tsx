import React, { FC, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'
import { TEditableSpecimen } from '../../../../schema/specimen'
import { TEditableVolume } from '../../../../schema/volume'
import ModalContainer from '../../../../components/ModalContainer'
import { TabSelect } from '../../../../components/TabSelect'
import Checkbox from '@mui/material/Checkbox'
import { toast } from 'react-toastify'

const marks = ['●', '○', '■', '□', '★', '☆', '△', '▲', '✶'] as const
type TMarks = (typeof marks)[number]

type TTab = 'symbols' | 'number'

interface MutationMarkSelectorModalProps {
  row: TEditableSpecimen | TEditableVolume
  open: boolean
  onClose: () => void
  onSave: (data: TEditableSpecimen | TEditableVolume) => void
}

const MutationMarkSelectorModal: FC<MutationMarkSelectorModalProps> = ({
  row,
  open,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation()
  const [inputMarks, setInputMarks] = useState(row.mutationMark ?? '')
  const [inputNumber, setInputNumber] = useState<string>(
    row.mutationMarkNumber ?? ''
  )
  const [inputNumberDescription, setInputNumberDescription] = useState<string>(
    row.mutationMarkNumberDescription ?? ''
  )
  const [inputNumberImpossible, setInputNumberImpossible] =
    useState<boolean>(false)

  const [inputMode, setInputMode] = useState<TTab>(
    row.mutationMarkNumber ? 'number' : 'symbols'
  )

  useEffect(() => {
    if (open) setInputMarks(row.mutationMark)
  }, [open, row.mutationMark])

  const doClose = () => {
    // setInputMarks('')
    onClose()
  }

  const handleSave = () => {
    onSave({
      ...row,
      mutationMark: inputMarks,
      mutationMarkNumber: inputNumber,
      mutationMarkNumberDescription: inputNumberDescription,
    })
    doClose()
  }

  const handleSymbolSelect = (symbol: TMarks) => {
    // if (inputMarks === '' || inputMarks.includes(symbol)) {
    setInputMarks((prevState) => prevState + symbol)
    // }
  }

  const handleInputChange = (value: string) => {
    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      marks.includes(value) ||
      value === '' ||
      value.length < inputMarks.length
    )
      setInputMarks(value.trim())
  }

  const handleInputNumberChange = (value: string) => {
    console.log(value)

    if (/^\d*$/.test(value)) {
      setInputNumber(value)
    }
  }

  return (
    <ModalContainer
      header={t('volume_overview.mutation_mark')}
      opened={open}
      onClose={doClose}
      closeButton={{
        callback: () => doClose(),
      }}
      acceptButton={{
        callback: () => {
          if (
            inputMode === 'number' &&
            !inputNumber &&
            !inputNumberImpossible
          ) {
            toast(t('volume_overview.mutation_mark_number_error'), {
              type: 'error',
            })
            return
          }
          handleSave()
        },
      }}
      style="fitted"
    >
      <TabSelect<TTab>
        options={[
          {
            label: t('volume_overview.mutation_mark_tab_symbol'),
            value: 'symbols',
          },
          {
            label: t('volume_overview.mutation_mark_tab_number'),
            value: 'number',
          },
        ]}
        selectedItem={inputMode}
        setSelectedItem={(value) => setInputMode(value)}
        onSelectCallback={(value) => {
          // delete respective values
          if (value === 'number') {
            setInputMarks('')
          } else {
            setInputNumber('')
            setInputNumberDescription('')
          }
        }}
      />
      <div style={{ height: 32 }} />
      {inputMode === 'symbols' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            value={inputMarks}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <Box sx={{ maxWidth: 400 }}>
            {marks.map((mark) => (
              <Button
                // disabled={inputMarks.length > 0 && !inputMarks.includes(mark)}
                key={`mutation-mark-${mark}`}
                onClick={() => handleSymbolSelect(mark)}
                sx={{
                  fontSize: '20px',
                }}
              >
                {mark}
              </Button>
            ))}
          </Box>
        </Box>
      )}
      {inputMode === 'number' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          <TextField
            label={t('volume_overview.mutation_mark_label_number_decription')}
            value={inputNumber}
            disabled={inputNumberImpossible}
            onChange={(e) => handleInputNumberChange(e.target.value)}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyItems: 'center',
              marginBottom: 2,
            }}
          >
            <Checkbox
              checked={inputNumberImpossible}
              disabled={!!inputNumber && inputNumber !== '?'}
              onChange={(e) => {
                if (e.target.checked) {
                  setInputNumber('?')
                } else {
                  setInputNumber('')
                }
                setInputNumberImpossible(e.target.checked)
              }}
            />
            <div style={{ marginTop: 8 }}>
              {t(
                'volume_overview.mutation_mark_label_number_decription_impossible'
              )}
            </div>
          </Box>
          <TextField
            label={t('volume_overview.mutation_mark_label_number')}
            value={inputNumberDescription}
            onChange={(e) => setInputNumberDescription(e.target.value)}
          />
        </Box>
      )}
    </ModalContainer>
  )
}

export default MutationMarkSelectorModal
