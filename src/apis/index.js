import OpenSubtitles from './opensubtitles/';
import Yfi from './yifi/';
import Podnapisi from './podnapisi/';
import TheSubDb from './thesubdb/';
import Addic7ed from './addic7ed/';

export default [
  new OpenSubtitles(),
  new Yfi(),
  new Podnapisi(),
  new TheSubDb(),
  new Addic7ed()
]
