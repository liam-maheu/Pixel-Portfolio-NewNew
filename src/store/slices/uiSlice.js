import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMenuOpen: false,
  isModalOpen: false,
  currentModal: null,
  theme: 'dark',
  showHUD: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleHUD: (state) => {
      state.showHUD = !state.showHUD;
    },
  },
});

export const { toggleMenu, toggleModal, setTheme, toggleHUD } = uiSlice.actions;
export default uiSlice.reducer; 