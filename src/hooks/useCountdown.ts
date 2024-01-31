import { useEffect, useState } from 'react';

const useCountdown = (targetDate: Date) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
      if(Date.now() - countDownDate > 0) {
        clearInterval(interval);
      }
    }, 1000);



    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

function formatTo2Digits(number: number) {
  return String(number).padStart(2, '0');
}

const getReturnValues = (countDown: number) => {
  // calculate time left
  const days = formatTo2Digits(Math.floor(countDown / (1000 * 60 * 60 * 24)));
  const hours = formatTo2Digits(Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  ));
  const minutes = formatTo2Digits(Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = formatTo2Digits(Math.floor((countDown % (1000 * 60)) / 1000));


  return [days, hours, minutes, seconds];
};

export { useCountdown };
