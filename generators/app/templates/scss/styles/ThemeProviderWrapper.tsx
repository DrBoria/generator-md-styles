import { FC } from 'react';

import styles from './themes/index.module.scss';

type TThemeProviderWrapperProps = {
  theme?: 'light' | 'dark';
};
const ThemeProviderWrapper: FC<TThemeProviderWrapperProps> = ({ theme = 'light', children }) => (
  <div className={styles[theme]}>{children}</div>
);
export default ThemeProviderWrapper;
