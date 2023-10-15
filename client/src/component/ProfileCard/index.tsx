import styles from './styles.module.scss';

import { useNavigate } from 'react-router-dom';

import duck from '../../img/duckicon.png';

export const ProfileCard: React.FC = () => {
  const nav = useNavigate();
  return (
    <button
      className={styles.ProfileCard}
      onClick={() => {
        nav('/stats');
      }}
    >
      <img alt="avatar" src={duck} />
      <p className={styles.InfoText}>Click here to view your stats!</p>
      <div className={styles.Table}>
        <div>
          <h2>Username</h2>
        </div>
        <div>
          <h3>Salary: $123</h3>
        </div>
      </div>
    </button>
  );
};
