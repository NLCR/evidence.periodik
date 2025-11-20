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
import {
  emptyMutationMark,
  TMutationMark,
  TMutationMarkType,
} from '../../../../utils/mutationMark'

const marks = ['●', '○', '■', '□', '★', '☆', '△', '▲', '✶'] as const
type TMarks = (typeof marks)[number]

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
  const [inputMarkState, setInputMarkState] = useState<TMutationMark>(
    row.mutationMark ?? emptyMutationMark
  )
  const [inputNumberImpossible, setInputNumberImpossible] = useState(false)

  useEffect(() => {
    if (open) {
      setInputMarkState(row.mutationMark ?? emptyMutationMark)
    }
  }, [open, row.mutationMark])

  const doClose = () => {
    // setInputMarks('')
    onClose()
  }

  const handleSave = () => {
    onSave({
      ...row,
      mutationMark: inputMarkState,
    })
    doClose()
  }

  const handleSymbolSelect = (symbol: TMarks) => {
    // if (inputMarks === '' || inputMarks.includes(symbol)) {
    setInputMarkState((prevState) => ({
      ...prevState,
      mark: prevState.mark + symbol,
    }))
    // }
  }

  const handleInputChange = (value: string) => {
    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      marks.includes(value) ||
      value === '' ||
      (inputMarkState.mark && value.length < inputMarkState.mark.length)
    )
      setInputMarkState((prev) => ({ ...prev, mark: value.trim() }))
  }

  const handleInputNumberChange = (value: string) => {
    console.log(value)

    if (/^\d*$/.test(value)) {
      setInputMarkState((prev) => ({ ...prev, mark: value }))
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
            inputMarkState.type === 'NUMBER' &&
            !inputMarkState.mark &&
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
      <TabSelect<TMutationMarkType>
        options={[
          {
            label: t('volume_overview.mutation_mark_tab_symbol'),
            value: 'MARK',
          },
          {
            label: t('volume_overview.mutation_mark_tab_number'),
            value: 'NUMBER',
          },
        ]}
        selectedItem={inputMarkState.type ?? 'MARK'}
        setSelectedItem={(value) =>
          setInputMarkState((prev) => ({ ...prev, type: value }))
        }
        onSelectCallback={(value) => {
          setInputMarkState({
            type: value,
            mark: '',
            description: '',
          })
        }}
      />
      <div style={{ height: 32 }} />
      {inputMarkState.type === 'MARK' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            value={inputMarkState.mark}
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
      {inputMarkState.type === 'NUMBER' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          <TextField
            label={t('volume_overview.mutation_mark_label_number_decription')}
            value={inputMarkState.mark}
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
              disabled={!!inputMarkState.mark && inputMarkState.mark !== '?'}
              onChange={(e) => {
                if (e.target.checked) {
                  setInputMarkState((prev) => ({ ...prev, mark: '?' }))
                } else {
                  setInputMarkState((prev) => ({ ...prev, mark: '' }))
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
            value={inputMarkState.description}
            onChange={(e) =>
              setInputMarkState((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </Box>
      )}
    </ModalContainer>
  )
}

export default MutationMarkSelectorModal
