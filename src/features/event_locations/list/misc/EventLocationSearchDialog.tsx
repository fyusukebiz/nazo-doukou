import {
  Dialog,
  Button,
  Slide,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { teal } from "@mui/material/colors";
import { TransitionProps } from "@mui/material/transitions";
import {
  Dispatch,
  Ref,
  SetStateAction,
  forwardRef,
  useEffect,
  useMemo,
} from "react";
import {
  EventLocationSearchFormSchema,
  defaultEventLocationSearchFormValues,
  useEventLocationSearchFormContext,
} from "./EventLocationSearchFormProvider";
import { EventLocationSearchForm } from "./EventLocationSearchForm";
import { useGameTypesQuery } from "@/react_queries/game_types/useGameTypesQuery";
import { IoMdClose } from "react-icons/io";
import { usePrefecturesQuery } from "@/react_queries/prefectures/usePrefecturesQuery";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  setQueryParams: Dispatch<SetStateAction<EventLocationSearchFormSchema>>;
  setIsInitialized: Dispatch<SetStateAction<boolean>>;
  setPage: Dispatch<SetStateAction<number>>;
};

export const EventLocationSearchDialog = (props: Props) => {
  const { isOpen, onClose, setQueryParams, setIsInitialized, setPage } = props;
  const { reset, getValues } = useEventLocationSearchFormContext();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { data: gameTypesData, status: gameTypesStatus } = useGameTypesQuery();

  const { data: prefecturesData, status: prefecturesStatus } =
    usePrefecturesQuery();

  // 場所の選択肢
  const locationOpts = useMemo(() => {
    if (prefecturesStatus !== "success") return [];
    return prefecturesData.prefectures
      .map((pref) =>
        pref.locations.map((loc) => ({
          value: loc.id,
          label: `${pref.name} / ${loc.name}`,
        }))
      )
      .flat();
  }, [prefecturesData, prefecturesStatus]);

  // ゲームタイプの選択肢
  const gameTypeOpts = useMemo(() => {
    if (gameTypesStatus !== "success") return [];
    return gameTypesData.gameTypes.map((type) => ({
      value: type.id,
      label: type.name,
    }));
  }, [gameTypesData, gameTypesStatus]);

  // 前回の検索結果を復元
  useEffect(() => {
    const rawParams = sessionStorage.getItem("eventLocationSearchParams");
    if (rawParams) {
      const params = JSON.parse(rawParams);
      params.date = new Date(params.date);
      setQueryParams(params);
      reset(params);
    }
    const rawPage = sessionStorage.getItem("eventLocationSearchPage");
    if (rawPage) setPage(Number(rawPage));
    setIsInitialized(true); // 初回リクエスト開始
    // formattedQueryParamsが計算されてから、react-queryのリクエスト処理が発生することを確認した
  }, [reset, setIsInitialized, setPage, setQueryParams]);

  // 検索ボタンを押した時
  const handleClickSearch = () => {
    const values = getValues();

    setQueryParams(values);
    // 検索条件を保存
    sessionStorage.setItem("eventLocationSearchParams", JSON.stringify(values));

    onClose();
  };

  // 全てのクリアボタンを押した時
  const handleClear = () => {
    sessionStorage.removeItem("companySearchParams");
    reset(defaultEventLocationSearchFormValues);
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={isOpen}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
    >
      <DialogTitle
        sx={{ m: 0, p: 2, backgroundColor: teal[400], color: "white" }}
      >
        イベント検索
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "white",
        }}
      >
        <IoMdClose />
      </IconButton>
      <DialogContent sx={{ padding: "24px" }} dividers>
        <EventLocationSearchForm
          gameTypeOpts={gameTypeOpts}
          locationOpts={locationOpts}
          onSubmit={handleClickSearch}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="primary"
          sx={{ textDecoration: "underline" }}
          onClick={handleClear}
        >
          全てクリア
        </Button>
        <Button
          variant="contained"
          color="teal"
          size="large"
          sx={{ width: "150px" }}
          onClick={handleClickSearch}
        >
          検索
        </Button>
      </DialogActions>
    </Dialog>
  );
};
