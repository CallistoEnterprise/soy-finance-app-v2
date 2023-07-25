import {createEvent, createStore} from "effector";

export const $soyPrice = createStore<number | null>(null);

export const setSoyPrice = createEvent<number>("Set soy price for footer");

$soyPrice.on(setSoyPrice, (_, data) => data);
