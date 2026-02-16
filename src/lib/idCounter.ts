let msgCounter = 200;

export function makeId() {
  msgCounter += 1;
  return `msg-${msgCounter}`;
}

export function resetMsgCounter() {
  msgCounter = 200;
}
