import { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { useWindowSize } from 'react-use';
import { LoadingSpinner } from '@/components/spinners/LoadingSpinner';

type IsMobileContextProps = {
  isMobile: boolean;
  isMobileOrTablet: boolean;
};

const IsMobileContext = createContext<IsMobileContextProps>({} as IsMobileContextProps);

export const useIsMobileContext = () => useContext(IsMobileContext);

type Props = {
  children: ReactNode;
};

export const IsMobileProvider = ({ children }: Props) => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState<boolean>();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>();

  useEffect(() => {
    setIsMobile(width <= 480);
    setIsMobileOrTablet(width <= 1280);
  }, [width]);

  return isMobile === undefined || isMobileOrTablet === undefined ? (
    <LoadingSpinner />
  ) : (
    <IsMobileContext.Provider value={{ isMobile, isMobileOrTablet }}>{children}</IsMobileContext.Provider>
  );
};
