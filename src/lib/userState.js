import { writable } from 'svelte/store';

export const user = writable({userName: 'Guest', userPlainNum: 0, userId: null});
