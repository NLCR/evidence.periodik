import { blue } from '@mui/material/colors'
import Typography from '@mui/material/Typography'
import React from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { TOwner } from '../../../../../schema/owner'
import Loader from '../../../../../components/Loader'
import WarningIcon from '@mui/icons-material/Warning'

type Props = {
  owners: TOwner[] | undefined
  ownerId: string
  libraryIds: string[] | undefined
  isLoading: boolean
  isError: boolean
}

const LibraryExternalLink = ({
  libraryIds,
  isError,
  isLoading,
  ownerId,
  owners,
}: Props) => {
  const owner = owners?.find((o) => o.id === ownerId)

  const libraryId = libraryIds?.find(
    (libraryId) => owner && libraryId.startsWith(owner.shorthand.toLowerCase())
  )

  if (isLoading) return <Loader size={'small'} />
  if (isError)
    return (
      <span>
        <WarningIcon />
      </span>
    )
  if (!libraryId) return null

  return (
    <Typography
      component="a"
      href={`https://www.knihovny.cz/Record/${libraryId}`}
      target="_blank"
      rel="noreferrer"
      sx={{
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        color: blue['700'],
        transition: 'color 0.1s',
        ':hover': {
          color: blue['900'],
        },
      }}
    >
      {owner?.shorthand}{' '}
      <OpenInNewIcon
        sx={{
          marginLeft: '3px',
        }}
      />
    </Typography>
  )
}

export default LibraryExternalLink
