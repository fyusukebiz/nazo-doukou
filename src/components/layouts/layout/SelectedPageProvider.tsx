import { useRouter } from 'next/router';
import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';

export type Page = 'companies' | 'jobs' | 'rooms' | 'orders' | 'settings';

type SelectedPageContextProps = {
  selectedPage: Page;
  setSelectedPage: Dispatch<SetStateAction<Page>>;
};

const SelectedPageContext = createContext<SelectedPageContextProps>({} as SelectedPageContextProps);

export const useSelectedPageContext = () => useContext(SelectedPageContext);

type Props = {
  children: ReactNode;
};

export const SelectedPageProvider = ({ children }: Props) => {
  const [selectedPage, setSelectedPage] = useState<Page>('companies');
  const router = useRouter();

  useEffect(() => {
    const pathname = router.pathname;

    if (/^\/companies/.test(pathname)) {
      setSelectedPage('companies');
    } else if (/^\/jobs/.test(pathname)) {
      setSelectedPage('jobs');
    } else if (/^\/rooms/.test(pathname)) {
      setSelectedPage('rooms');
    } else if (pathname === '/orders') {
      setSelectedPage('orders');
    } else if (/^\/settings/.test(pathname)) {
      setSelectedPage('settings');
    }
  }, [router.pathname]);

  return (
    <SelectedPageContext.Provider value={{ selectedPage, setSelectedPage }}>{children}</SelectedPageContext.Provider>
  );
};
