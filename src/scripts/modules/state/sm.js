import { produce } from "immer"
import { renderDOM } from "../render"

const lastState = [];

export function initState (state) {
    lastState.push(state);
    renderDOM(state);
}

export const updateState = function updateState (updateFucnt) {
    lastState[lastState.length - 1]
    const nextState = produce(lastState[lastState.length - 1], updateFucnt);
    renderDOM(nextState);
    lastState.push(nextState);
    return true;
}

export const updateStatePromise = function updateStatePromise (updateFucnt) {
    return new Promise((resolve, reject) => {
        try {
            const nextState = produce(lastState[lastState.length - 1], updateFucnt);
            renderDOM(nextState);
            lastState.push(nextState);
            resolve();
        } catch (err) {
            reject(err);
        }
    })
}

export function getCurrentState () {
    return lastState[lastState.length - 1];
}

export function getStateHistory() {
    return lastState;
}

export const undo = function undo () {
    if (lastState.length <= 1) return;
    lastState.pop();
    renderDOM(lastState[lastState.length - 1]);
    return true;
}