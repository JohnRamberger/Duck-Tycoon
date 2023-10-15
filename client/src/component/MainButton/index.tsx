import styles from './styles.module.scss';
import globalstyles from '../../global.module.scss';

import { Tooltip } from 'antd';

interface MainButtonProps {
  title: string;
  img: string;
  onClick: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export const MainButton: React.FC<MainButtonProps> = ({
  title,
  img,
  onClick,
  disabled = false,
  disabledMessage = '',
}: MainButtonProps) => {
  return (
    <Tooltip title={disabled ? disabledMessage : ''}>
      <button
        className={`${styles.Button} ${disabled ? `${styles.Disabled}` : ''}`}
        onClick={disabled ? () => {} : onClick}
        style={{ height: '24vmin' }}
      >
        <h2 style={{ textAlign: 'center' }} className={globalstyles.Subtitle}>
          {title}
        </h2>
        <img src={img} alt={title} style={{ height: '100%', width: 'auto' }} />
      </button>
    </Tooltip>
  );
};
