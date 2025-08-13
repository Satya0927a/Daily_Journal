const infolog = (...params)=>{
  console.log(...params);
  
}
const errorlog = (...params)=>{
  console.error(...params);
}

module.exports = {infolog,errorlog}