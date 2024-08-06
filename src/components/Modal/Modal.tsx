import { Content, Overlay, Portal, Root } from "@radix-ui/react-dialog";
import { FC, ReactNode } from "react";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  fullScreen?: boolean;
  closeOnOverlayClick?: boolean;
};

export const Modal: FC<Props> = ({
  open,
  onOpenChange,
  children,
  fullScreen = false,
  closeOnOverlayClick = true,
}) => (
  <Root open={open} onOpenChange={onOpenChange}>
    <Portal>
      <Overlay
        onClick={(e) => {
          e.stopPropagation();
          closeOnOverlayClick ? onOpenChange(false) : () => {};
        }}
        className={styles.overlay}
      />
      <Content data-fullscreen={fullScreen} className={styles.content}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}
        >
          <span />
        </button>

        <div>{children}</div>
      </Content>
    </Portal>
  </Root>
);
