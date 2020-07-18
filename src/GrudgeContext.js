import React, { useReducer, useCallback, createContext } from "react";
import initialState from './initialState';
import id from 'uuid/v4';

const GRUDGE_ADD = 'GRUDGE_ADD';
const GRUDGE_FORGIVE = 'GRUDGE_FORGIVE';

const defaultState = {
    past: [],
    present: initialState,
    future: []
}

const reducer = (state = defaultState, action) => {
    if (action.type === 'GRUDGE_ADD') {
        const newPresent = [{ ...action.payload }, ...state.present];
        return {
            past: [state.present, ...state.past],
            present: newPresent,
            future: []
        };
    }
    if (action.type === 'GRUDGE_FORGIVE') {
        const newPresent = state.present.map((grudge) => {
            if (grudge.id === action.payload.id) return { ...grudge, forgiven: !grudge.forgiven };
            return grudge;
        });
        return {
            past: [state.present, ...state.past],
            present: newPresent,
            future: []
        };
    }
    if (action.type === 'UNDO') {
        const [newPresent, ...newPast] = state.past;
        return {
            past: newPast,
            present: newPresent,
            future: [state.present, ...state.future]
        }
    }
    if (action.type === 'REDO') {
        const [newPresent, ...newFuture] = state.future;
        return {
            past: [state.present, ...state.past],
            present: newPresent,
            future: newFuture
        }
    }
    return state;
}

export const GrudgeContext = createContext();

export const GrudgeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, defaultState);
    const grudges = state.present;
    const isPast = !!state.past.length;
    const isFuture = !!state.future.length;

    const addGrudge = useCallback(({ person, reason }) => {
        dispatch({
            type: GRUDGE_ADD,
            payload: {
                person,
                reason,
                forgiven: false,
                id: id()
            }
        });
    }, [dispatch]);

    const toggleForgiveness = useCallback(id => {
        //was an exercise`
        dispatch({
            type: GRUDGE_FORGIVE,
            payload: {
                id
            }
        });
    }, [dispatch]);

    const undo = useCallback(() => {
        dispatch({
            type: 'UNDO'
        });
    }, [dispatch]);

    const redo = useCallback(() => {
        dispatch({
            type: 'REDO'
        });
    }, [dispatch]);

    const value = { grudges, addGrudge, toggleForgiveness, redo, undo, isPast, isFuture };

    return <GrudgeContext.Provider value={value}>{children}</GrudgeContext.Provider>
}