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

import FundDialog from '@/components/fund-dialog';
import { Dispatch, ReactNode, SetStateAction, createContext, useMemo, useState } from 'react';

export interface FundContext {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const FundContext = createContext<FundContext>({
  open: false,
  setOpen: () => undefined,
});

export const FundProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <FundContext.Provider value={value}>
      {children}
      <FundDialog open={open} setOpen={setOpen} />
    </FundContext.Provider>
  );
};
