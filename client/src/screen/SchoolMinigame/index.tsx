import { Button, Card, Flex, Result } from 'antd';
import globalstyles from '../../global.module.scss';
// import styles from './styles.module.scss';

import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { SchoolQuestion } from '../../component/SchoolQuestion';
import { SCHOOL_QUESTIONS } from '../../data/questions';
import { useMutation } from '@tanstack/react-query';

import { auth } from '../../firebase';

export const SchoolMinigame: React.FC = () => {
  const nav = useNavigate();
  const [screen, setScreen] = useState<'start' | 'question' | 'result' | 'end'>(
    'start'
  );

  const [result, setResult] = useState<'wrong' | 'unset' | 'correct'>(
    'correct'
  );

  // eslint-disable-next-line
  const [questions, setQuestions] = useState(
    SCHOOL_QUESTIONS.sort(() => 0.5 - Math.random()).slice(0, 5)
  );

  const [correct, setCorrect] = useState(0);
  const [current, setCurrent] = useState(0);

  const [loading, setLoading] = useState(true);

  const winMutation = useMutation({
    mutationFn: ({ userid }: { userid: String }) =>
      fetch(`/api/user/${userid}/actions/study`, {
        method: 'POST'
      }),
  });

  const handleNext = async () => {
    if (current === 4) {
      // check if won
      if (correct >= 4) {
        winMutation.mutate(
          { userid: auth.currentUser?.uid! },
          {
            onSuccess: () => {
              setLoading(false);
            },
          }
        );
      } else {
        setLoading(false);
      }

      // done
      setScreen('end');
      return;
    }

    setCurrent(current + 1);
    setScreen('question');
  };

  return (
    <div className={globalstyles.Center}>
      {screen === 'start' && (
        <Card title="Before you begin!" style={{ maxWidth: '40vmax' }}>
          <p>
            In this activity, your goal is to answer as many questions correct
            as you can. You must get 4 of the 5 questions correct to receive
            credit.
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
          timeLimit={30}
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
          title={correct >= 4 ? 'Good work!' : 'Better luck next time'}
          style={{ maxWidth: '40vmax', fontSize: '1.5em' }}
          headStyle={{ fontSize: '1em' }}
        >
          <p>
            {correct >= 4
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
  );
};
