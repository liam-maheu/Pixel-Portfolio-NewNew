import { useSelector, useDispatch } from 'react-redux';
import { toggleModal } from '../store/slices/uiSlice';

function UI() {
  const dispatch = useDispatch();
  const { isModalOpen } = useSelector((state) => state.ui);

  return (
    <div className="ui-overlay">
      {/* Modal for Case Studies */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Modal Content</h2>
            <button onClick={() => dispatch(toggleModal())}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UI; 