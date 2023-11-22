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
import { Dispatch, Ref, SetStateAction, forwardRef, useMemo } from "react";
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
};

export const EventLocationSearchDialog = (props: Props) => {
  const { isOpen, onClose, setQueryParams } = props;
  const { reset, getValues } = useEventLocationSearchFormContext();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { data: gameTypesData, status: gameTypesStatus } = useGameTypesQuery();

  const { data: prefecturesData, status: prefecturesStatus } =
    usePrefecturesQuery();

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

  const gameTypeOpts = useMemo(() => {
    if (gameTypesStatus !== "success") return [];
    return gameTypesData.gameTypes.map((type) => ({
      value: type.id,
      label: type.name,
    }));
  }, [gameTypesData, gameTypesStatus]);

  const handleClickSearch = () => {
    const values = getValues();

    setQueryParams(values);
    // 検索条件を保存
    sessionStorage.setItem("eventLocationSearchParams", JSON.stringify(values));

    onClose();
  };

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
