import { Avatar as MuiAvatar, Box } from "@mui/material";
import { grey } from "@mui/material/colors";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { toast } from "react-toastify";
import { useEditMyUserFormContext } from "./EditMyUserFormProvider";

type Props = {
  initialAvatarUrl?: string;
};

export const Avatar = ({ initialAvatarUrl }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setValue } = useEditMyUserFormContext();
  const [imageUrl, setImageUrl] = useState(initialAvatarUrl || "");

  const handleClickAttachImage = useCallback(
    () => fileInputRef.current?.click(),
    []
  );

  const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files?.[0];
    if (!file) return;
    if (
      file.size >
      Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) * 1000 * 1000
    ) {
      toast.error(
        `ファイルが大きすぎます。最大${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB}MBまで。`
      );
      return;
    }
    setValue("iconImageFile", file);
    setImageUrl(URL.createObjectURL(file));
  };

  return (
    <Box>
      {imageUrl ? (
        // <Box sx={{ position: "relative" }}>
        <MuiAvatar
          alt="avatar"
          src={imageUrl}
          sx={{ width: "96px", height: "96px" }}
          onClick={handleClickAttachImage}
        />
      ) : (
        // </Box>
        <Box
          sx={{
            borderRadius: "50%",
            border: `2px dashed ${grey[300]}`,
            borderSpacing: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            height: "96px",
            width: "fit-content",
            aspectRatio: "1 / 1",
          }}
          onClick={handleClickAttachImage}
        >
          <AiOutlinePlus size={16} color={grey[500]} />
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChangeFile}
        style={{ display: "none" }}
      />
    </Box>
  );
};
