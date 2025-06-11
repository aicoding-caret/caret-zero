import { jsx as _jsx } from "react/jsx-runtime";
// Caret 전용 상태 관리
import { createContext, useContext, useReducer } from 'react';
const initialState = {
    templateCharacters: [],
    isLoading: false
};
function caretReducer(state, action) {
    switch (action.type) {
        case 'SET_PERSONA':
            return { ...state, persona: action.payload };
        case 'SET_TEMPLATE_CHARACTERS':
            return { ...state, templateCharacters: action.payload };
        case 'SET_SELECTED_PERSONA_ID':
            return { ...state, selectedPersonaId: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}
const CaretStateContext = createContext(undefined);
export const CaretStateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(caretReducer, initialState);
    return (_jsx(CaretStateContext.Provider, { value: { state, dispatch }, children: children }));
};
export const useCaretState = () => {
    const context = useContext(CaretStateContext);
    if (context === undefined) {
        throw new Error('useCaretState must be used within a CaretStateProvider');
    }
    return context;
};
//# sourceMappingURL=CaretStateContext.js.map