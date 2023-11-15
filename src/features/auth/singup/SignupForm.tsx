import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/material";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useState } from "react";
import { toast } from "react-toastify";
import { setCookie } from "cookies-next";
import { cookieOptions } from "@/constants/cookieOptions";
import { useRouter } from "next/router";
import { usePostMyUser } from "@/react_queries/my_user/usePostMyUser";
import { FirebaseError } from "firebase/app";
import { firebaseErrors } from "@/constants/firebaseErrors";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import { SignupFormSchema, useSignupFormContext } from "./SignupFormProvider";
import { SubmitHandler } from "react-hook-form";
import { grey } from "@mui/material/colors";

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { postMyUser } = usePostMyUser();
  const {
    getValues,
    control,
    handleSubmit,
    formState: { errors },
  } = useSignupFormContext();

  // ユーザーが登録ボタンを押したときにdoRegister関数が実行される
  const onSubmit: SubmitHandler<SignupFormSchema> = async (rawData) => {
    const auth = getAuth();
    const values = getValues();

    setIsLoading(true);
    try {
      // Firebaseで用意されているユーザー登録の関数
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      // ユーザー登録すると自動的にログインされてuserCredential.userでユーザーの情報を取得できる
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();

      // TODO: FEでsetCookieすべきじゃない
      setCookie("currentFbUserIdToken", idToken, cookieOptions);

      // DBにUserを作成する
      // cookieをセット
      const user = {
        name: values.name,
        ...(values.twitter && { twitter: values.twitter }),
        ...(values.instagram && { instagram: values.instagram }),
      };
      await postMyUser.mutateAsync({ body: { user } });

      // 認証用のメールを送る
      await sendEmailVerification(userCredential.user);

      router.push("/auth/verify");
    } catch (error) {
      // console.log(error);
      if (error instanceof FirebaseError) {
        // console.log(error.code);
        toast.error(firebaseErrors[error.code]);
      } else {
        toast.error("登録に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: "15px" }}
    >
      <InputWithLabelRHF<SignupFormSchema>
        name="name"
        type="text"
        placeholder="ユーザー名"
        autoComplete="username"
        control={control}
        fullWidth
      />
      <Box sx={{ color: grey[500], fontSize: "12px" }}>
        どちらかのSNSのユーザー名を入力してください
      </Box>
      <InputWithLabelRHF<SignupFormSchema>
        name="twitter"
        type="text"
        placeholder="X ユーザー名(@不要)*"
        control={control}
        fullWidth
      />
      <InputWithLabelRHF<SignupFormSchema>
        name="instagram"
        type="text"
        placeholder="インスタ ユーザー名*"
        control={control}
        fullWidth
      />
      <InputWithLabelRHF<SignupFormSchema>
        name="email"
        type="email"
        placeholder="メールアドレス"
        autoComplete="email"
        control={control}
        fullWidth
      />
      <InputWithLabelRHF<SignupFormSchema>
        name="password"
        type="password"
        placeholder="パスワード"
        control={control}
        autoComplete="new-password"
        fullWidth
      />
      <InputWithLabelRHF<SignupFormSchema>
        name="passwordConfirm"
        type="password"
        placeholder="パスワード確認"
        control={control}
        fullWidth
      />

      <LoadingButton
        type="submit"
        color="teal"
        variant="contained"
        sx={{ height: "50px" }}
        loading={isLoading}
      >
        登録
      </LoadingButton>
    </Box>
  );
};
