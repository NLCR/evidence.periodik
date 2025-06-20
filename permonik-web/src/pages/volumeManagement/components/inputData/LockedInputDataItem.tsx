import Box from '@mui/material/Box'
import React from 'react'

type Props = { value: string | undefined }

const LockedInputDataItem = ({ value }: Props) => {
  return <Box sx={{ marginY: 1 }}>{value ?? '-'}</Box>
}

export default LockedInputDataItem
