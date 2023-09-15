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

import { FieldValues } from 'react-hook-form';

export interface IMessage {
  id: string;
  msg: string | File;
  contentType?: string;
  type: 'response' | 'request';
  timestamp: number;
  height: number;
  cid?: number;
  from: string;
  to: string;
}

export type voteForOptions = 'model' | 'script' | 'operator';

export interface LicenseForm extends FieldValues {
  derivations?: 'With-Credit' | 'With-Indication' | 'With-License-Passthrough' | 'With-Revenue-Share',
  revenueShare?: number,
  commercialUse?: 'Allowed' | 'Allowed-With-Credit',
  licenseFeeInterval?: 'One-Time' | string,
  licenseFee?: number,
  currency?: 'AR' | '$U',
  expires?: number,
  paymentAddress?: string,
  paymentMode?: 'Random-Distribution' | 'Global-Distribution'
};