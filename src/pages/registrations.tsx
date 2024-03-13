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
import { FIND_BY_TAGS, QUERY_TX_WITH } from '@/queries/graphql';
import { ApolloError, useQuery } from '@apollo/client';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TAG_NAMES,
  CANCEL_OPERATION,
  secondInMS,
  OPERATOR_REGISTRATION_PAYMENT_TAGS,
  U_LOGO_SRC,
  PROTOCOL_NAME,
  PROTOCOL_VERSION,
  DEFAULT_TAGS,
} from '@/constants';
import { IEdge, ITransactions } from '@/interfaces/arweave';
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Icon,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import _ from 'lodash';
import useOnScreen from '@/hooks/useOnScreen';
import {
  commonUpdateQuery,
  displayShortTxOrAddr,
  findTag,
  parseUnixTimestamp,
} from '@/utils/common';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CopyIcon from '@mui/icons-material/ContentCopy';
import arweave from '@/utils/arweave';
import { useSnackbar } from 'notistack';
import DebounceButton from '@/components/debounce-button';
import FairSDKWeb from '@fair-protocol/sdk/web';

interface Registration {
  scriptName: string;
  scriptTransaction: string;
  scriptCurator: string;
  operatorFee: number;
  operatorName: string;
  timestamp: string;
}

const RegistrationContent = ({
  registration,
  text,
  color,
}: {
  registration: Registration;
  text: string;
  color: string;
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = useCallback(() => {
    if (registration.scriptTransaction) {
      (async () => {
        await navigator.clipboard.writeText(registration.scriptTransaction);
        enqueueSnackbar('Copied to clipboard', { variant: 'info' });
      })();
    }
  }, [registration, enqueueSnackbar]);

  const handleViewExplorer = useCallback(
    () =>
      window.open(`https://viewblock.io/arweave/tx/${registration.scriptTransaction}`, '_blank'),
    [registration],
  );

  return (
    <CardContent
      sx={{ display: 'flex', gap: '16px', justifyContent: 'space-between', padding: '8px 16px' }}
    >
      <Box>
        <Box display={'flex'} gap={'8px'}>
          <Typography fontWeight={'600'}>Script Transaction:</Typography>
          <Tooltip title={registration.scriptTransaction}>
            <Typography>
              {displayShortTxOrAddr(registration.scriptTransaction)}
              <IconButton size='small' onClick={handleCopy}>
                <CopyIcon fontSize='inherit' />
              </IconButton>
              <IconButton size='small' onClick={handleViewExplorer}>
                <OpenInNewIcon fontSize='inherit' />
              </IconButton>
            </Typography>
          </Tooltip>
        </Box>
        <Box display={'flex'} gap={'8px'}>
          <Typography fontWeight={'600'}>Script Curator:</Typography>
          <Tooltip title={registration.scriptCurator}>
            <Typography>
              {displayShortTxOrAddr(registration.scriptCurator)}
              <IconButton size='small'>
                <CopyIcon fontSize='inherit' />
              </IconButton>
            </Typography>
          </Tooltip>
        </Box>
        <Box display={'flex'} gap={'8px'}>
          <Typography fontWeight={'600'}>Timestamp:</Typography>
          <Typography noWrap>{`${registration.timestamp} (${parseUnixTimestamp(
            registration.timestamp,
          )})`}</Typography>
        </Box>
      </Box>
      <Box>
        <Box display={'flex'} gap={'8px'} alignItems={'center'}>
          <Typography fontWeight={'600'}>Operator Name:</Typography>
          <Typography>{registration.operatorName}</Typography>
        </Box>
        <Box display={'flex'} gap={'8px'} alignItems={'center'}>
          <Typography fontWeight={'600'}>Operator Fee:</Typography>
          <Typography>{registration.operatorFee}</Typography>
          <img src={U_LOGO_SRC} width={'18px'} height={'18px'} />
        </Box>
      </Box>
      <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
        <Box display={'flex'} gap={'8px'}>
          <Button
            variant='outlined'
            disabled
            sx={{
              color,
              '&.MuiButtonBase-root:disabled': {
                color,
                borderColor: color,
              },
            }}
          >
            <Typography>{text}</Typography>
          </Button>
        </Box>
      </Box>
    </CardContent>
  );
};

const RegistrationCard = ({ tx }: { tx: IEdge }) => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const theme = useTheme();
  const { currentAddress, dispatchTx } = useContext(WalletContext);
  const { enqueueSnackbar } = useSnackbar();

  const registration = useMemo(() => {
    const scriptName = findTag(tx, 'scriptName') ?? 'Script Name Not Found';
    const scriptCurator = findTag(tx, 'scriptCurator') ?? 'Script Curator Not Found';
    const scriptTransaction = findTag(tx, 'scriptTransaction') ?? 'Script Transaction Not Found';
    const operatorFee = findTag(tx, 'operatorFee') ?? 'Operator Fee Not Found';
    const operatorName = findTag(tx, 'operatorName') ?? 'Operator Name Not Found';
    const timestamp = findTag(tx, 'unixTime') ?? 'Timestamp Not Found';

    const parsedFee = parseFloat(operatorFee) / FairSDKWeb.utils.U_DIVIDER;

    return {
      scriptName,
      scriptTransaction,
      scriptCurator,
      operatorName,
      timestamp,
      operatorFee: parsedFee,
    };
  }, [tx]);

  const id: string = useMemo(() => tx.node.id, [tx]);
  const sequencerId = useMemo(
    () => FairSDKWeb.utils.findTag(tx, 'sequencerTxId') ?? tx.node.id,
    [tx],
  );

  const { data: cancelData } = useQuery(QUERY_TX_WITH, {
    variables: {
      address: currentAddress,
      tags: [
        ...DEFAULT_TAGS,
        { name: TAG_NAMES.operationName, values: [CANCEL_OPERATION] },
        { name: TAG_NAMES.registrationTransaction, values: [id] },
      ],
    },
    skip: !id,
  });

  const color = useMemo(() => {
    if (isCancelled) {
      return theme.palette.neutral.main;
    } else if (isConfirmed) {
      return theme.palette.success.main;
    } else {
      return theme.palette.warning.main;
    }
  }, [isConfirmed, isCancelled]);

  const text = useMemo(() => {
    if (isCancelled) {
      return 'Cancelled';
    } else if (isConfirmed) {
      return 'Active';
    } else {
      return 'Pending';
    }
  }, [isConfirmed, isCancelled]);

  useEffect(() => {
    if (cancelData && cancelData.transactions.edges.length > 0) {
      setIsCancelled(true);
    }
  }, [cancelData]);

  useEffect(() => {
    if (sequencerId) {
      (async () => {
        const x = await FairSDKWeb.utils.isUTxValid(sequencerId);
        setIsConfirmed(x);
      })();
    }
  }, [sequencerId]);

  const handleCancel = useCallback(() => {
    (async () => {
      // cancel tx
      try {
        const cancelTx = await arweave.createTransaction({
          data: 'Cancel Transaction',
        });
        cancelTx.addTag(TAG_NAMES.protocolName, PROTOCOL_NAME);
        cancelTx.addTag(TAG_NAMES.protocolVersion, PROTOCOL_VERSION);
        cancelTx.addTag(TAG_NAMES.operationName, CANCEL_OPERATION);
        cancelTx.addTag(TAG_NAMES.registrationTransaction, id);
        cancelTx.addTag(TAG_NAMES.scriptName, registration.scriptName);
        cancelTx.addTag(TAG_NAMES.scriptCurator, registration.scriptCurator);
        cancelTx.addTag(TAG_NAMES.scriptTransaction, registration.scriptTransaction);
        cancelTx.addTag(TAG_NAMES.unixTime, (Date.now() / secondInMS).toString());

        const cancelResult = await dispatchTx(cancelTx);
        setIsCancelled(true);
        enqueueSnackbar(
          <>
            Cancel Transaction Sent
            <br></br>
            <a
              href={`https://viewblock.io/arweave/tx/${cancelResult.id}`}
              target={'_blank'}
              rel='noreferrer'
            >
              <u>View Transaction in Explorer</u>
            </a>
          </>,
          {
            variant: 'success',
          },
        );
      } catch (error) {
        enqueueSnackbar('Cancel Transaction Failed', { variant: 'error' });
      }
    })();
  }, [id, registration]);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={registration.scriptName}
        sx={{ padding: '8px 16px' }}
        action={
          <Tooltip title='View in Explorer'>
            <span>
              <IconButton
                size='small'
                href={`https://viewblock.io/arweave/tx/${id}`}
                target='_blank'
              >
                <OpenInNewIcon />
              </IconButton>
            </span>
          </Tooltip>
        }
      />
      <RegistrationContent registration={registration} color={color} text={text} />
      {!isCancelled && (
        <CardActions
          sx={{ display: 'flex', justifyContent: 'center', padding: '8px 16px', gap: '8px' }}
        >
          <DebounceButton onClick={handleCancel} variant='outlined'>
            <Typography>Cancel</Typography>
          </DebounceButton>
        </CardActions>
      )}
    </Card>
  );
};

const RegistrationError = ({
  error,
  children,
}: {
  error?: ApolloError;
  children: ReactElement;
}) => {
  if (error) {
    return (
      <Box display={'flex'} flexDirection={'column'} alignItems={'center'} padding={'16px'}>
        <Typography textAlign={'center'}>
          There Was a Problem Fetching previous payments...
        </Typography>
      </Box>
    );
  } else {
    return children;
  }
};

const RegistrationsEmpty = ({
  data,
  children,
}: {
  data: { transactions: ITransactions };
  children: ReactElement;
}) => {
  if (data && data.transactions.edges.length === 0) {
    return (
      <Box>
        <Typography textAlign={'center'}>You Have No Pending Transactions</Typography>
      </Box>
    );
  } else {
    return children;
  }
};

const Registrations = () => {
  const elementsPerPage = 10;
  const [filterValue, setFilterValue] = useState('');
  const [filteredValues, setFilteredValues] = useState<IEdge[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const target = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(target);
  const justifyContent = 'space-between';

  const theme = useTheme();
  const { currentAddress } = useContext(WalletContext);

  const tags = [
    ...DEFAULT_TAGS,
    ...OPERATOR_REGISTRATION_PAYMENT_TAGS,
    { name: TAG_NAMES.sequencerOwner, values: [currentAddress] },
  ];
  const { data, previousData, loading, error, fetchMore, refetch } = useQuery(FIND_BY_TAGS, {
    variables: { tags, first: elementsPerPage },
    skip: !currentAddress,
  });

  useEffect(() => {
    if (data && !_.isEqual(data, previousData)) {
      setHasNextPage(data.transactions.pageInfo.hasNextPage);
    }
  }, [data]);

  useEffect(() => {
    if (isOnScreen && hasNextPage) {
      const txs = data.transactions.edges;
      (async () => {
        await fetchMore({
          variables: {
            after: txs.length > 0 ? txs[txs.length - 1].cursor : undefined,
          },
          updateQuery: commonUpdateQuery,
        });
      })();
    }
  }, [isOnScreen, hasNextPage]);

  useEffect(() => {
    if (filterValue && data) {
      const filteredData = data.transactions.edges.filter(
        (el: IEdge) =>
          el.node.id.toLowerCase().indexOf(filterValue) !== -1 ||
          findTag(el, 'operationName')?.toLowerCase().indexOf(filterValue) !== -1,
      );
      setFilteredValues(filteredData);
    } else if (data) {
      setFilteredValues(data.transactions.edges);
    } else {
      setFilteredValues([]);
    }
  }, [filterValue, data]);

  const refreshClick = useCallback(() => {
    (async () => {
      await refetch();
    })();
  }, [refetch]);

  const handleFilterChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setFilterValue(event.target.value),
    [setFilterValue],
  );

  return (
    <Container sx={{ paddingTop: '16px' }} maxWidth='lg'>
      <RegistrationError error={error}>
        <RegistrationsEmpty data={data}>
          <>
            <Box display={'flex'} justifyContent={justifyContent} padding={'16px 8px'}>
              <Button onClick={refreshClick} endIcon={<RefreshIcon />} variant='outlined'>
                <Typography>Refresh</Typography>
              </Button>
              <Box
                width={'40%'}
                sx={{
                  borderRadius: '30px',
                  display: 'flex',
                  justifyContent,
                  padding: '3px 20px 3px 0px',
                  alignItems: 'center',
                  background: theme.palette.background.default,
                  border: '0.5px solid #355064',
                }}
              >
                <InputBase
                  sx={{
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '18px',
                    lineHeight: '16px',
                    width: '100%',
                    padding: '0px 16px',
                  }}
                  onChange={handleFilterChange}
                  placeholder='Search By Id, Recipient or Operation Name'
                />
                <Icon
                  sx={{
                    height: '30px',
                  }}
                >
                  <img src='./search-icon.svg'></img>
                </Icon>
              </Box>
            </Box>
            <Stack spacing={2}>
              {filteredValues.map((tx: IEdge) => (
                <RegistrationCard key={tx.node.id} tx={tx} />
              ))}
            </Stack>
          </>
        </RegistrationsEmpty>
      </RegistrationError>
      {loading && (
        <Backdrop
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            borderRadius: '23px',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
          }}
          open={true}
        >
          <Typography variant='h2' color={theme.palette.primary.main}>
            Fetching Latest Payments...
          </Typography>
          <CircularProgress color='primary' />
        </Backdrop>
      )}
      <Box ref={target} sx={{ paddingBottom: '16px' }}></Box>
    </Container>
  );
};

export default Registrations;
