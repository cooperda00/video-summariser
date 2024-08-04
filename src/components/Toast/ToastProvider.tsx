import * as Toast from '@radix-ui/react-toast';
import { ReactNode } from 'react';
import styles from './Toast.module.css';

type Props = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: Props) => {
  return (
    <Toast.Provider>
      {children}
      <Toast.Viewport className={styles.viewport} />
    </Toast.Provider>
  );
};
