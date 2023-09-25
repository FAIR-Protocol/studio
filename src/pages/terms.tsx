/*
 * Fair Protocol, open source decentralised inference marketplace for artificial intelligence.
 * Copyright (C) 2023 Fair Protocol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

import { InfoOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Typography, useTheme } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleBack = useCallback(() => navigate('/'), [navigate]);

  return (
    <Box m={'10%'} display={'flex'} flexDirection={'column'} alignItems={'center'} gap={'32px'}>
      <Alert
        variant='outlined'
        severity='info'
        sx={{
          marginBottom: '16px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          '& .MuiAlert-icon': {
            justifyContent: 'center',
          },
          '& .MuiAlert-message': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: theme.palette.text.primary,
          },
        }}
        icon={
          <Box display={'flex'} alignItems={'center'} gap={'8px'}>
            <InfoOutlined fontSize='large' />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '23px',
                lineHeight: '31px',
              }}
            >
              Terms And Conditions
            </Typography>
          </Box>
        }
      >
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: '30px',
            lineHeight: '41px',
            display: 'block',
            textAlign: 'justify',
          }}
        >
          All the communication between participants in this network is done through Arweave. When
          anything is written on Arweave, it&apos;s publicly stored forever due to the
          particularities of that blockchain. As such, kindly exercise caution when inserting any
          information on this website.
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: '30px',
            lineHeight: '41px',
            display: 'block',
            textAlign: 'justify',
          }}
        >
          By using this app, you acknowledge and accept these terms and conditions.
        </Typography>
      </Alert>
      <Button sx={{ width: 'fit-content' }} variant='outlined' onClick={handleBack}>
        <Typography>Back To Studio</Typography>
      </Button>
    </Box>
  );
};

export default Terms;
