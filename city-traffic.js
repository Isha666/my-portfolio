export const crossings=[19,52,85,117,163,218];
export const laneOffsets=[2.25,5.08];
const start=-15,end=278,gap=5.7;

export function signalPhase(distance,time){
 const phase=(time+distance*.09)%12;
 return phase<8?2:phase<9.5?1:0;
}

export function createTraffic(count){
 const cars=Array.from({length:count},(_,index)=>{
  const side=index%2===0?1:-1,lane=Math.floor(index/2)%2;
  const slot=Math.floor(index/4),perLane=Math.ceil(count/4);
  const distance=12+slot*(end-28)/perLane+lane*4+Number(side<0)*7;
  return {distance,side,lane,speed:4.1+index%5*.45};
 }).filter((car,index)=>car.side!==1||car.lane!==1||Math.floor(index/4)%3===2);
 let time=0;
 function limit(from,to,direction,side,lanes,others,checkSignals){
  let available=Math.max(0,(to-from)*direction);
  for(const obstacle of others){
   if(obstacle.side!==side||!obstacle.lanes.some(lane=>lanes.includes(lane)))continue;
   const separation=(obstacle.distance-from)*direction;
   if(separation>0)available=Math.min(available,Math.max(0,separation-gap));
  }
  if(checkSignals)for(const crossing of crossings){
   const stop=crossing-direction*4;
   const separation=(stop-from)*direction;
   if(separation>=-1e-6&&signalPhase(crossing,time)!==2)available=Math.min(available,Math.max(0,separation));
  }
  return from+available*direction;
 }
 return {
  cars,
  phase(distance){return signalPhase(distance,time);},
  canTurn(distance){return !cars.some(car=>Math.abs(car.distance-distance)<5.5);},
  canChange(distance,lane,side=1){
   return !cars.some(car=>car.side===side&&car.lane===lane&&Math.abs(car.distance-distance)<gap+.75);
  },
  drive(from,to,lanes,side=1){
   if(from===to)return from;
   return limit(from,to,Math.sign(to-from),side,lanes,cars.map(car=>({...car,lanes:[car.lane]})),(to-from)*side>0);
  },
  tick(dt,player){
   time+=dt;
   for(const side of [-1,1])for(let lane=0;lane<2;lane++){
    const queue=cars.filter(car=>car.side===side&&car.lane===lane).sort((a,b)=>side*(b.distance-a.distance));
    let leader;
    for(const car of queue){
     const entering=side===1?start:end,leaving=side===1?end:start;
     if((car.distance-leaving)*side>=0){
      if(queue.some(other=>other!==car&&Math.abs(other.distance-entering)<gap+1)){
       leader=car;continue;
      }
      car.distance=entering;
      // A vehicle that just wrapped cannot be the leader for cars at the far end.
      continue;
     }
     const obstacles=[];
     if(leader)obstacles.push({...leader,lanes:[lane]});
     if(player){
      if(player.turning){
       obstacles.push({distance:player.distance,side,lanes:[0,1]});
      }else obstacles.push({distance:player.distance,side:player.side??1,lanes:player.lanes});
     }
     const target=car.distance+side*car.speed*dt;
     car.distance=limit(car.distance,side===1?Math.min(target,end):Math.max(target,start),side,side,[lane],obstacles,true);
     leader=car;
    }
   }
  }
 };
}
