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

import { WalletContext } from '@/context/wallet';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef } from 'react';
import PowerIcon from '@mui/icons-material/Power';
import { EIP1193Provider } from 'viem';
import { EIP6963ProviderDetail } from '@/interfaces/evm';
import { EVMWalletContext } from '@/context/evm-wallet';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { InfoOutlined } from '@mui/icons-material';

const ProviderElement = ({ provider, setOpen }: { provider: EIP6963ProviderDetail, setOpen: Dispatch<SetStateAction<boolean>> }) => {
  const { currentAddress, connect } = useContext(EVMWalletContext);
  const { updateStorageValue } = useLocalStorage('evmProvider');

  const handleEvmConnect = useCallback(async () => {
    await connect(provider.provider as EIP1193Provider);
    updateStorageValue(provider.info.name);
    setOpen(false);
  }, [ connect ]);

  return <ListItem
    key={provider.info.uuid}
    secondaryAction={
      <Button
        aria-label='connect'
        variant='contained'
        onClick={handleEvmConnect}
        disabled={!!currentAddress}
        endIcon={<PowerIcon />}
        className='plausible-event-name=EVM+Connected'
      >
        <Typography>{currentAddress ? 'Connected' : 'Connect'}</Typography>
      </Button>
    }
  >
    <ListItemAvatar>
      <Avatar src={provider.info.icon} alt='provider.info.name' />
    </ListItemAvatar>
    <ListItemText primary={provider.info.name} />
  </ListItem>;
};

const ChooseWallet = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  // components/layout.js
  const theme = useTheme();
  const { isArConnectAvailable, connectWallet, currentAddress } = useContext(WalletContext);
  const { providers } = useContext(EVMWalletContext);
  const forceDisable = true;

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const handleArConnect = useCallback(() => connectWallet('arconnect'), [connectWallet]);
  const handleArweaveApp = useCallback(() => connectWallet('arweave.app'), [connectWallet]);

  const prevWalletValue = useRef<string | null>(localStorage.getItem('wallet'));

  useEffect(() => {
    if (prevWalletValue.current !== localStorage.getItem('wallet')) {
      prevWalletValue.current = localStorage.getItem('wallet');
      setOpen(false);
    }
  }, [localStorage.length]); // run this code when the value of count changes

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={'sm'}
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(61, 61, 61, 0.9)'
              : theme.palette.background.default,
        },
        borderRadius: '10px'
      }}
    >
      <DialogTitle>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '23px',
            lineHeight: '31px',
          }}
        >
          {'Connect Wallet'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Divider textAlign='left'>
          <Typography>
            {'Arweave Wallets'}
          </Typography>
        </Divider>
        <List>
          <ListItem
            secondaryAction={
              <Button
                aria-label='connect'
                variant='contained'
                onClick={handleArConnect}
                disabled={!isArConnectAvailable || localStorage.getItem('wallet') === 'arconnect'}
                endIcon={<PowerIcon />}
                className='plausible-event-name=ArConnect+Connect+Click'
              >
                <Typography>{currentAddress ? 'Connected' : !isArConnectAvailable || localStorage.getItem('wallet') === 'arconnect' ? 'Not Available' : 'Connect'}</Typography>
              </Button>
            }
          >
            <ListItemAvatar>
              <Avatar src='./arconnect-logo.png' />
            </ListItemAvatar>
            <ListItemText primary='ArConnect' />
          </ListItem>
          <ListItem
            secondaryAction={
              <Button
                aria-label='connect'
                variant='contained'
                onClick={handleArweaveApp}
                disabled={forceDisable} // disable until we have a working version
                endIcon={<PowerIcon />}
                className='plausible-event-name=ArweaveApp+Connect+Click'
              >
                <Typography fontStyle={'bold'}>{'Not Available'}</Typography>
              </Button>
            }
          >
            <ListItemAvatar>
              <Avatar src='./arweave-logo-for-light.png' />
            </ListItemAvatar>
            <ListItemText primary='Arweave.app' />
          </ListItem>
        </List>
        <Divider textAlign='left'>
          <Typography>
            {'EVM Wallets'}
          </Typography>
        </Divider>
        <List>
          {providers.map((provider) => (
            <ProviderElement key={provider.info.uuid} provider={provider} setOpen={setOpen} />
          ))}
        </List>
        <Alert
          /* onClose={() => setOpen(false)} */
          variant='outlined'
          severity='info'
          sx={{
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center'
          }}
          icon={<InfoOutlined />}
        >
          <Typography>
            {
              'Operators will need to connect both an Arweave and EVM wallet to access all functionalities.'
            }
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          paddingBottom: '20px',
        }}
      >
        <Button
          variant='outlined'
          onClick={handleClose}
          sx={{ width: 'fit-content' }}
          className='plausible-event-name=Close+Choose+Wallet+Popup'
        >
          <Typography>Close</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChooseWallet;
