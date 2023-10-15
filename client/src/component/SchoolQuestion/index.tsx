import { Badge, Button, Card, Flex } from 'antd';
import { MCQ } from '../../data/questions';
import styles from './styles.module.scss';
import { useState, useEffect } from 'react';

interface SchoolQuestionProps {
  mcq: MCQ;
  qNumber?: number;
  timeLimit?: number;

  onNoAnswer?: () => void;
  onWrongAnswer?: () => void;
  onCorrectAnswer?: () => void;
}

export const SchoolQuestion: React.FC<SchoolQuestionProps> = ({
  mcq,
  qNumber = 1,
  timeLimit = 15,
  onNoAnswer = () => {},
  onWrongAnswer = () => {},
  onCorrectAnswer = () => {},
}: // mcq,
SchoolQuestionProps) => {
  const [selected, setSelected] = useState(-1);
  const [countdown, setCountdown] = useState(timeLimit);
  // eslint-disable-next-line
  const [answers, setAnswers] = useState(
    shuffle([...mcq.fakeAnswers, mcq.answer])
  );

  useEffect(() => {
    countdown > 0 &&
      setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

    if (countdown <= 0) {
      handleSubmit();
    }
    // eslint-disable-next-line
  }, [countdown, answers]);

  const handleSubmit = () => {
    if (selected === -1) {
      onNoAnswer();
      return;
    }
    if (answers.indexOf(mcq.answer) === selected) {
      onCorrectAnswer();
      return;
    } else {
      onWrongAnswer();
      return;
    }
  };

  return (
    <Card
      className={countdown <= 3 ? styles.Shake : ''}
      title={`Question ${qNumber}`}
      style={{ maxWidth: '50vmax', fontSize: '20px' }}
      extra={<Badge count={countdown} />}
    >
      <Flex vertical style={{}} gap={'1em'}>
        <div>
          <h2>{mcq.question}</h2>
        </div>
        <Flex wrap="wrap" align="stretch" className={styles.Answers} gap="1em">
          <input
            id="duck-input-1"
            type="radio"
            name="duck-mcq"
            onChange={(e) => {
              if (e.target.value) setSelected(0);
            }}
          />
          <label htmlFor="duck-input-1">{answers[0]}</label>
          <input
            id="duck-input-2"
            type="radio"
            name="duck-mcq"
            onChange={(e) => {
              if (e.target.value) setSelected(1);
            }}
          />
          <label htmlFor="duck-input-2">{answers[1]}</label>
        </Flex>
        <Flex wrap="wrap" align="stretch" className={styles.Answers} gap="1em">
          <input
            id="duck-input-3"
            type="radio"
            name="duck-mcq"
            onChange={(e) => {
              if (e.target.value) setSelected(2);
            }}
          />
          <label htmlFor="duck-input-3">{answers[2]}</label>
          <input
            id="duck-input-4"
            type="radio"
            name="duck-mcq"
            onChange={(e) => {
              if (e.target.value) setSelected(3);
            }}
          />
          <label htmlFor="duck-input-4">{answers[3]}</label>
        </Flex>
        <Flex justify="flex-end">
          <Button onClick={handleSubmit}>Submit</Button>
        </Flex>
      </Flex>
    </Card>
  );
};

const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};
