import { useEffect } from 'react';

function C() {
  useEffect(() => {
    new Promise((resolve, reject) => {
      reject(1);
    }).catch(error => {
      console.log('error', error);
    });
  }, []);

  return <div>C</div>;
}

export default C;
