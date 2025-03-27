import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  playerPosition: { x: 0, y: 0 },
  currentZone: 'city',
  discoveredItems: [],
  isInteracting: false,
  currentInteraction: null,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updatePlayerPosition: (state, action) => {
      state.playerPosition = action.payload;
    },
    setCurrentZone: (state, action) => {
      state.currentZone = action.payload;
    },
    discoverItem: (state, action) => {
      state.discoveredItems.push(action.payload);
    },
    setInteraction: (state, action) => {
      state.isInteracting = action.payload.isInteracting;
      state.currentInteraction = action.payload.item;
    },
  },
});

export const { updatePlayerPosition, setCurrentZone, discoverItem, setInteraction } = gameSlice.actions;
export default gameSlice.reducer; 