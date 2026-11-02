import { loadContent } from '../../lib/content.ts';
import { searchIndex } from '../../lib/search.ts';

/* 한국어 페이지의 찾기가 받아 오는 영어 글 색인(한국어 글은 페이지에 이미 있다). 찾기 창을 처음 열 때만 받는다 */
export const GET = () => new Response(JSON.stringify(searchIndex(loadContent(), 'en')), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
