import { Button, Card, Flex, Result } from 'antd';
import globalstyles from '../../global.module.scss';
import styles from './styles.module.scss';

import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { SchoolQuestion } from '../../component/SchoolQuestion';
import { WORK_QUESTIONS1 } from '../../data/questions';
import { useMutation } from '@tanstack/react-query';

import { auth } from '../../firebase';

import bee1 from '../../img/bee1-removebg-preview.png';
import bee2 from '../../img/bee2-removebg-preview.png';

import duck1 from '../../img/duckanimate1-removebg-preview.png';
import duck2 from '../../img/duckanimate2-removebg-preview.png';

export const WorkMinigame1: React.FC = () => {
  // animate

  const [duckImage, setDuckImage] = useState(false);

  useEffect(() => {
    const x = setInterval(() => {
      setDuckImage((prev) => !prev);
    }, 500);
    return () => {
      clearInterval(x);
    };
    // eslint-disable-next-line
  }, []);

  // data

  const nav = useNavigate();
  const [screen, setScreen] = useState<'start' | 'question' | 'result' | 'end'>(
    'start'
  );

  const [result, setResult] = useState<'wrong' | 'unset' | 'correct'>(
    'correct'
  );

  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line
  const [questions, setQuestions] = useState(
    WORK_QUESTIONS1.sort(() => 0.5 - Math.random()).slice(0, 5)
  );

  const [correct, setCorrect] = useState(0);
  const [current, setCurrent] = useState(0);

  const winMutation = useMutation({
    mutationFn: ({ userid }: { userid: String }) =>
      fetch(`/api/user/${userid}/actions/work`, {
        method: 'POST',
      }),
  });

  const handleNext = () => {
    setCurrent(current + 1);
    if (current === 4) {
      if (correct - 1 - current > -3) {
        // win
        setLoading(true);
        winMutation.mutate(
          { userid: auth.currentUser?.uid! },
          {
            onSuccess: () => {
              setLoading(false);
            },
          }
        );
      }

      // done
      setScreen('end');
      return;
    }

    if (correct - 1 - current <= -3) {
      setScreen('end');
      return;
    }

    setScreen('question');
  };

  return (
    <>
      <div className={styles.AnimFrame}>
        <img
          src={duckImage ? bee1 : bee2}
          alt="duck"
          className={styles.AnimBee}
          style={{ transform: `translateX(${(Math.max(current - correct, 0)) * 28}vw)` }}
        />
        <img
          src={duckImage ? duck1 : duck2}
          alt="duck"
          className={styles.AnimDuck}
        />
      </div>
      <div className={globalstyles.Center} style={{ height: '80vh' }}>
        {screen === 'start' && (
          <Card title="Before you begin!" style={{ maxWidth: '40vmax' }}>
            <p>
              Run away from the bee! Incorrect answers slow you down, decreasing
              the gap between you and your enemy...
            </p>
            <Flex justify="flex-end" gap={'1em'}>
              <Button
                type="text"
                onClick={() => {
                  nav('/main');
                }}
              >
                Cancel
              </Button>
              <Button
                type="default"
                onClick={() => {
                  setScreen('question');
                }}
              >
                Start
              </Button>
            </Flex>
          </Card>
        )}
        {screen === 'question' && (
          <SchoolQuestion
            mcq={questions[current]}
            qNumber={current + 1}
            onCorrectAnswer={() => {
              setCorrect(correct + 1);
              setResult('correct');
              setScreen('result');
            }}
            onNoAnswer={() => {
              setResult('unset');
              setScreen('result');
            }}
            onWrongAnswer={() => {
              setResult('wrong');
              setScreen('result');
            }}
          />
        )}
        {screen === 'result' && (
          <Card title="Result" style={{ maxWidth: '40vmax' }}>
            {result === 'correct' && (
              <Result
                status={'success'}
                title="You got the correct answer!"
                extra={<Button onClick={handleNext}>Next</Button>}
              />
            )}
            {result === 'unset' && (
              <Result
                status={'warning'}
                title="Make sure to select an answer in time!"
                extra={<Button onClick={handleNext}>Next</Button>}
              />
            )}
            {result === 'wrong' && (
              <Result
                status={'error'}
                title={`The correct answer was: ${questions[current].answer}`}
                extra={<Button onClick={handleNext}>Next</Button>}
              />
            )}
          </Card>
        )}
        {screen === 'end' && (
          <Card
            title={
              correct - current > -3 ? 'You escaped!' : 'The bee got you...'
            }
            style={{ maxWidth: '40vmax', fontSize: '1.5em' }}
            headStyle={{ fontSize: '1em' }}
          >
            <p>
              {correct - 1 - current > -3
                ? `You passed with ${correct}/5 correct!`
                : `You failed with ${correct}/5 correct.`}
            </p>
            <Flex justify="flex-end">
              <Button
                onClick={() => {
                  nav('/main');
                }}
                loading={loading}
              >
                Go Home
              </Button>
            </Flex>
          </Card>
        )}
      </div>
    </>
  );
};
