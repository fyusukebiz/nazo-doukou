import { Theme } from 'next-auth';

export const html = (params: { url: string; serviceName: string; theme: Theme }) => {
  const { url, serviceName, theme } = params;

  const brandColor = theme.brandColor || '#346df1';
  const color = {
    background: '#f9f9f9',
    text: '#444',
    mainBackground: '#fff',
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || '#fff',
  };

  return `
    <body style="background: ${color.background};">
      <div width="100%" border="0" cellspacing="20" cellpadding="0"
        style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center">
            <img src="${process.env.NEXT_PUBLIC_HOST}/service_logo.png" width="100" height="100" alt='logo' style="border-radius: 10px;" />
          </td>
        </tr>
        <tr>
          <td align="center"
            style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            <strong>${serviceName} へようこそ</strong>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 0 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <p style="text-align: center; word-break: break-word;">${url}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center"
            style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            認証用リンクの期限は24時間です。
          </td>
        </tr>
        <tr>
          <td align="center"
            style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            このメールに見覚えがない場合は、無視をお願いします。
          </td>
        </tr>
      </table>
    </body>
  `;
};

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
export const text = ({ url, serviceName }: { url: string; serviceName: string }) => {
  return `ログインしてください：${serviceName}\n${url}\n\n`;
};
