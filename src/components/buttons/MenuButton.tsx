import { IconButton, Menu } from "@mui/material";
import {
  useState,
  MouseEvent,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from "react";
import { HiDotsVertical } from "react-icons/hi";

type Props = {
  children: ReactNode;
};

export type MenuButtonHandler = {
  closeMenu(): void;
};

export const MenuButton = forwardRef<MenuButtonHandler, Props>((props, ref) => {
  const { children } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClickMenu = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  useImperativeHandle(ref, () => ({
    closeMenu() {
      handleCloseMenu();
    },
  }));

  return (
    <>
      <IconButton
        aria-label="more"
        id="misc-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClickMenu}
      >
        <HiDotsVertical />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "misc-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {children}
      </Menu>
    </>
  );
});
