/**
 * Redux Store for VoiceAI Platform
 */

// Create store function
function createStore(reducer) {
  let state;
  const listeners = [];

  const getState = () => state;

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
    return action;
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  // Initialize store with default state
  dispatch({});

  return { getState, dispatch, subscribe };
}