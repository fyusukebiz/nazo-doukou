import { Box, Button, Chip } from "@mui/material";
import { useWatch } from "react-hook-form";
import { ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { useEditEventFormContext } from "./EditEventFormProvider";

export const CoverImageFileAttachButtonWithLabel = () => {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useEditEventFormContext();
  const file = useWatch({ control, name: "coverImageFile" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileButtonClicked = () => fileInputRef.current?.click();

  const handleChangeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files || []; // 新たに追加するファイル
    if (files.length < 1) return;
    const file = files[0];
    if (
      file.size >
      Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) * 1000 * 1000
    ) {
      toast.error(
        `ファイルが大きすぎます。最大${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB}MBまで。`
      );
      return;
    }

    setValue("coverImageFile", file);
  };

  return (
    <>
      <Box
        component="label"
        sx={{
          display: "inline-block ",
          marginBottom: "8px",
          fontWeight: "bold",
        }}
      >
        {getValues("coverImageFileUrl")
          ? "ヘッダー画像 (画像添付ずみ)"
          : "ヘッダー画像"}
      </Box>
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFileButtonClicked}
        >
          ファイルを選択する
        </Button>
        {file && (
          <Box sx={{ marginTop: "10px" }}>
            <Chip
              label={file.name}
              onDelete={() => setValue("coverImageFile", null)}
              sx={{ mr: 2 }}
            />
          </Box>
        )}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChangeFile}
          style={{ display: "none" }}
        />
      </Box>
      {errors.coverImageFile?.message && (
        <Box sx={{ color: "red", fontSize: "10px", marginTop: "3px" }}>
          {errors.coverImageFile?.message}
        </Box>
      )}
    </>
  );
};
