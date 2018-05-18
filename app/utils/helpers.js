export const writeToPromise = (resolve, reject) => {
  return (err, res) => { 
    if(err) reject(err);
    else {
      resolve('success');
    }
  };
};

export const readToPromise = (resolve, reject) => {
  return (err, res) => { 
    console.log(err);
    if(err) reject(err);
    else {
      resolve(res);
    }
  };
};

