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

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import ProfileMenu from './profile-menu';
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import {
  Button,
  Icon,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  styled,
  Tooltip,
  useTheme,
} from '@mui/material';
import { WalletContext } from '@/context/wallet';
import CloseIcon from '@mui/icons-material/Close';
import Pending from './pending';
import NavigationMenu from './navigation-menu';
import { ChooseWalletContext } from '@/context/choose-wallet';
import { defaultDecimalPlaces, U_LOGO_SRC } from '@/constants';

const Banner = styled(Toolbar)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: '25px',
  },
}));

const CustomDropDownIcon = () => (
  <Icon
    sx={{
      pointerEvents: 'none',
      position: 'absolute',
      right: '7px',
    }}
  >
    <img src='./chevron-bottom.svg' />
  </Icon>
);

const CurrencyMenu = () => {
  const [selected, setSelected] = useState<'AR' | 'U'>('U');
  const { currentBalance, currentUBalance } = useContext(WalletContext);
  const theme = useTheme();
  const handleArClick = useCallback(() => {
    setSelected('AR');
  }, [setSelected]);

  const handleUClick = useCallback(() => {
    setSelected('U');
  }, [setSelected]);

  return (
    <>
      <Select
        sx={{
          '& .MuiInputBase-input': {
            display: 'flex',
            backgroundColor: theme.palette.secondary.main,
            border: 'none',
            textTransform: 'none',
            padding: 0,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              background: theme.palette.secondary.main,
            },
          },
        }}
        IconComponent={CustomDropDownIcon}
        value={selected}
      >
        <MenuItem value={'AR'} onClick={handleArClick}>
          <Typography
            sx={{ paddingRight: '6px', paddingLeft: '23px', lineHeight: '1.7' }}
            color={theme.palette.primary.contrastText}
          >
            {currentBalance.toFixed(defaultDecimalPlaces)}
          </Typography>
          <img width='20px' height='29px' src='./arweave-small.svg' />
        </MenuItem>
        <MenuItem value={'U'} onClick={handleUClick}>
          <Typography
            sx={{ paddingRight: '6px', paddingLeft: '23px', lineHeight: '1.7' }}
            color={theme.palette.primary.contrastText}
          >
            {currentUBalance.toFixed(defaultDecimalPlaces)}
          </Typography>
          <img width='20px' height='29px' src={U_LOGO_SRC} />
        </MenuItem>
      </Select>
    </>
  );
};

const WalletState = () => {
  const theme = useTheme();
  const { currentAddress, isWalletVouched } = useContext(WalletContext);

  const { setOpen: connectWallet } = useContext(ChooseWalletContext);

  const handleConnect = useCallback(() => connectWallet(true), [connectWallet]);

  if (!currentAddress || currentAddress === '') {
    return (
      <>
        <Box
          sx={{
            borderRadius: '23px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
            gap: '17px',
            background: theme.palette.secondary.main,
          }}
        >
          <Typography sx={{ paddingRight: '6px', paddingLeft: '23px' }}>Connect Wallet</Typography>
          <IconButton onClick={handleConnect} sx={{ paddingRight: '16px' }}>
            <img src='./icon-empty-wallet.svg' />
          </IconButton>
        </Box>
        <ProfileMenu />
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          borderRadius: '23px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          gap: '17px',
          background: theme.palette.secondary.main,
        }}
      >
        <Box display={'flex'}>
          <CurrencyMenu />
        </Box>
        <Box
          sx={{
            background: theme.palette.background.default,
            borderRadius: '43px',
            padding: '7px 20px 7px 20px',
          }}
          display={'flex'}
          gap={'8px'}
        >
          <Tooltip title={currentAddress} placement={'left-start'}>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {currentAddress.slice(0, 10)}...{currentAddress.slice(-3)}
            </Typography>
          </Tooltip>
          {isWalletVouched && (
            <Tooltip title={'Wallet is Vouched'}>
              <img src='./vouch.svg' />
            </Tooltip>
          )}
        </Box>
        <Pending />
      </Box>
      <ProfileMenu />
    </>
  );
};

const Navbar = ({
  showBanner,
  setShowBanner,
  setFilterValue,
}: {
  showBanner: boolean;
  setShowBanner: Dispatch<SetStateAction<boolean>>;
  setFilterValue: Dispatch<SetStateAction<string>>;
}) => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const extraIndex = 2; // number to add to zIndex to make sure it's above the drawer
  const zIndex = theme.zIndex.drawer + extraIndex; // add 2 to make sure it's above the drawer
  const navbarLinkStyles = {
    fontWeight: 400,
    fontSize: '18px',
    lineHeight: '24px',
    display: { sm: 'none', md: 'flex' },
  };

  let keyTimeout: NodeJS.Timeout;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(keyTimeout);
    keyTimeout = setTimeout(() => {
      setFilterValue(event.target.value);
    }, 500);
  };

  return (
    <>
      <AppBar className='navbar' sx={{ zIndex }}>
        {showBanner && (
          <Banner>
            <Box sx={{ flexGrow: 1, display: { md: 'flex', justifyContent: 'flex-start' } }}>
              <Typography variant='h4'>
                This App is in <b>ALPHA</b> version and the code has not been audited yet. Please
                make sure you understand before using any of the functionalities.
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <IconButton size='small' onClick={() => setShowBanner(false)}>
                <CloseIcon fontSize='inherit' />
              </IconButton>
            </Box>
          </Banner>
        )}
        <Toolbar>
          <Box display={'flex'} flexDirection={'row'}>
            <Link to='/'>
              <img
                src={
                  theme.palette.mode === 'dark'
                    ? './fair-protocol-logo.svg'
                    : './fair-protocol-logo-light.svg'
                }
              />
            </Link>
          </Box>
          <Box sx={{ flexGrow: 1 }} display={{ sm: 'none', lg: 'flex' }}>
            {' '}
            {/* hide searchbar on small screens */}
            {pathname && pathname === '/' && (
              <Box
                sx={{
                  borderRadius: '30px',
                  margin: '0 50px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '3px 20px 3px 50px',
                  alignItems: 'center',
                  background: theme.palette.background.default,
                }}
              >
                <InputBase
                  sx={{
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '18px',
                    lineHeight: '16px',
                    width: '100%',
                  }}
                  onChange={handleChange}
                  placeholder='Search...'
                />
                <Icon
                  sx={{
                    height: '30px',
                  }}
                >
                  <img src='./search-icon.svg'></img>
                </Icon>
              </Box>
            )}
          </Box>
          <Box
            className={'navbar-right-content'}
            sx={{
              justifyContent: { sm: 'flex-end', md: 'center' },
              gap: { sm: '16px', md: '34px' },
              flexGrow: { sm: 1, md: 0 },
            }}
          >
            <>
              <Typography
                component={NavLink}
                to='/upload-creator'
                className='navbar-links'
                sx={navbarLinkStyles}
              >
                Creators
              </Typography>
              <Typography
                component={NavLink}
                to='/upload-curator'
                className='navbar-links'
                sx={navbarLinkStyles}
              >
                Curators
              </Typography>
              <Typography component={NavLink} to='/' className='navbar-links' sx={navbarLinkStyles}>
                Operators
              </Typography>
              <NavigationMenu navStyles={navbarLinkStyles} />
              <WalletState />
            </>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {showBanner && <Banner />}
    </>
  );
};

export default Navbar;
