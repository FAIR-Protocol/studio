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

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Tooltip, Typography } from '@mui/material';
import { GITHUB_LINK, WHITEPAPER_LINK, TWITTER_LINK, DISCORD_LINK } from '@/constants';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { WalletContext } from '@/context/wallet';
import GetIcon from './get-icon';
import Box from '@mui/material/Box';
import { ChooseWalletContext } from '@/context/choose-wallet';
import { useState, useContext, MouseEvent, useCallback, Dispatch } from 'react';
import { useNavigate } from 'react-router-dom';
import { FundContext } from '@/context/fund';

const changeWallet = 'Change Wallet';
const operatorRegistrations = 'Operator Registrations';
const viewTerms = 'Terms And Conditions';
const bundlrSettings = 'Bundlr Settings';
const viewPrivacyPolicy = 'Privacy Policy';

const options = [
  bundlrSettings,
  'Whitepaper',
  'Github',
  'Discord',
  'Twitter',
  operatorRegistrations,
  viewTerms,
  viewPrivacyPolicy,
  changeWallet,
  'Disconnect',
];
const disableableOptions = [changeWallet, 'Disconnect', bundlrSettings, operatorRegistrations ];

const ITEM_HEIGHT = 64;

const Option = ({
  option,
  setAnchorEl,
}: {
  option: string;
  setAnchorEl: Dispatch<React.SetStateAction<HTMLElement | null>>;
}) => {
  const navigate = useNavigate();
  const { disconnectWallet } = useContext(WalletContext);
  const { setOpen: setChooseWalletOpen } = useContext(ChooseWalletContext);
  const { setOpen: setFundOpen } = useContext(FundContext);

  const handleOptionClick = useCallback(() => {
    (async () => {
      switch (option) {
        case bundlrSettings:
          setFundOpen(true);
          setAnchorEl(null);
          break;
        case 'Github':
          window.open(GITHUB_LINK, '_blank');
          break;
        case 'Discord':
          window.open(DISCORD_LINK, '_blank');
          break;
        case 'Twitter':
          window.open(TWITTER_LINK, '_blank');
          break;
        case 'Whitepaper':
          window.open(WHITEPAPER_LINK, '_blank');
          break;
        case operatorRegistrations:
          setAnchorEl(null);
          navigate('/registrations');
          break;
        case changeWallet:
          setAnchorEl(null);
          setChooseWalletOpen(true);
          return;
        case 'Disconnect':
          await disconnectWallet();
          setAnchorEl(null);
          return;
        case viewTerms:
          setAnchorEl(null);
          navigate('/terms');
          return;
        case viewPrivacyPolicy:
          setAnchorEl(null);
          navigate('/privacy-policy');
          return;
        default:
          setAnchorEl(null);
          return;
      }
    })();
  }, [option]);

  return (
    <MenuItem onClick={handleOptionClick} className={`plausible-event-name=Menu+${option.replaceAll(' ', '+')}+Click`}>
      <GetIcon input={option}></GetIcon>
      <Box sx={{ marginLeft: '10px' }}>
        <Typography>{option}</Typography>
      </Box>
    </MenuItem>
  );
};

export default function ProfileMenu() {
  const itemHeight = 4.5;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { currentAddress } = useContext(WalletContext);

  const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const showIcon = () => {
    if (!currentAddress) {
      return <>{open ? <CloseIcon color='action' /> : <MenuIcon color='action' />}</>;
    } else {
      return <img src='./icon-empty-wallet.png' width={'27px'} height={'27px'} />;
    }
  };

  return (
    <div>
      <IconButton
        aria-label='more'
        id='long-button'
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}
      >
        {showIcon()}
      </IconButton>
      <Menu
        id='long-menu'
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * itemHeight,
            width: '20ch',
          },
        }}
      >
        {options.map((option) =>
          disableableOptions.includes(option) && !currentAddress ? (
            <Tooltip title='This Feature requires a wallet to be connected' key={option}>
              <span>
                <MenuItem disabled>
                  <Typography>{option}</Typography>
                </MenuItem>
              </span>
            </Tooltip>
          ) : (
            <Option option={option} key={option} setAnchorEl={setAnchorEl} />
          ),
        )}
      </Menu>
    </div>
  );
}
