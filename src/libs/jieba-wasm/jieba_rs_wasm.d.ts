/* tslint:disable */
/* eslint-disable */
/**
* @param {string} text
* @param {boolean} hmm
* @returns {any[]}
*/
export function cut(text: string, hmm: boolean): any[];
/**
* @param {string} text
* @returns {any[]}
*/
export function cut_all(text: string): any[];
/**
* @param {string} text
* @param {boolean} hmm
* @returns {any[]}
*/
export function cut_for_search(text: string, hmm: boolean): any[];
/**
* @param {string} text
* @param {string} mode
* @param {boolean} hmm
* @returns {any[]}
*/
export function tokenize(text: string, mode: string, hmm: boolean): any[];
/**
* @param {string} word
* @param {number | undefined} freq
* @param {string | undefined} tag
* @returns {number}
*/
export function add_word(word: string, freq?: number, tag?: string): number;
