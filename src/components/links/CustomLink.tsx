import Link, { LinkProps } from 'next/link';
import { CSSProperties, ReactNode } from 'react';

type Props = {
  href: LinkProps['href'];
  children: ReactNode;
  style?: CSSProperties;
};

export const CustomLink = ({ href, children, style }: Props) => (
  <Link href={href} style={{ textDecoration: 'none', ...style }} passHref>
    {children}
  </Link>
);
