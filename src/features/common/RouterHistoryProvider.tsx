import { useRouter } from 'next/router';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';

type RouterHistoryContextProps = {
  routerHistory: [string, string]; // [現在のパス、ひとつ前のパス]
  setRouterHistory: Dispatch<SetStateAction<[string, string]>>;
};

// ひとつ前のパスを知る必要があるためこのコンポーネントを作成した

export const RouterHistoryContext = createContext<RouterHistoryContextProps>(
  {} as RouterHistoryContextProps
);

export const useRouterHistoryContext = () => useContext(RouterHistoryContext);

type Props = {
  children: ReactNode;
};

export const RouterHistoryProvider = ({ children }: Props) => {
  const router = useRouter();
  const [routerHistory, setRouterHistory] = useState<[string, string]>([
    '',
    '',
  ]);

  useEffect(() => {
    // WORKAROUND: ダイナミックパス（例：/drawings/[drawingId]）に遷移するとき、
    // router.asPathが以下のように変化する。
    // ①初めに、/drawings/[drawingId]
    // ②次に、/drawings/1
    // そのため、routerHistoryに"/drawings/[drawingId]"が含まれてしまう。
    // それを回避するためにパスに"["が含まれているときはrouterHistoryに値をセットしない
    const pathname = router.asPath;
    if (/\[/.test(pathname)) return;
    setRouterHistory((prev) => [pathname, prev[0]]);
  }, [router.asPath]);

  return (
    <RouterHistoryContext.Provider value={{ routerHistory, setRouterHistory }}>
      {children}
    </RouterHistoryContext.Provider>
  );
};
