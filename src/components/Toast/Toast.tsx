import { Description, Root, Title } from '@radix-ui/react-toast';
import styles from './Toast.module.css';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
};

export const Toast = ({ title, description, open, onOpenChange }: Props) => {
  return (
    <Root
      className={styles.root}
      open={open}
      onOpenChange={onOpenChange}
      onClick={() => onOpenChange(false)}
      type="background"
    >
      <Title className={styles.title}>{title}</Title>
      <Description className={styles.description}>{description}</Description>
    </Root>
  );
};
