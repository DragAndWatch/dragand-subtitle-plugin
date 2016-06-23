# dragand-subtitle-plugin - V2

Open Source library to get subtitles from famous externals apis like OpenSubtitles, theSubDB, Addic7ed, Yify subtitles or Podnapisi.

We use it on the Dragand Application download at http://www.dragand.watch

## Getting Started
- ES6-ES7

  ```javascript
    // DragandSubtitles is a singleton (to optimise performances with scrapping)
    import DragandSubtitles from 'dragand-subtitle-plugin';
  ```

- ES5

  ```javascript
    var DragandSubtitles = require('dragand-subtitle-plugin')
  ```

### Get subtitles
Each api need some specific parameters to be call. You can find all necessary parameters in a section below.

I want to get subtitles for "the big bang theory" , season 9, episode 17.
I want the french language and the english language.

```javascript
const languages = ['fr', 'en']; // Language in ISO 639-1 default []
const apis = ['podnapisi', 'addic7ed', 'open-subtitles', 'thesubdb']; // I want to use only podnapisi, addic7ed, open-subtitles, thesubdb default [] - all apis

// I set a file object with necessary parameters
const file = {
    fileName: 'the.big.bang.theory.920.hdtv-lol.mp4',
    filePath: '/path/to/the.big.bang.theory.917.hdtv-lol.mp4',
    title:'the big bang theory',
    season: 9,
    episode: 17,
    releaseGroup: 'LOL'
  }

  DragandSubtitles.getSubtitles('serie', file, languages, apis)
    .then( results => {
      // results looks like
      // { errors: [/* potential error on each api */], subtitles: { fr: [ [Object] ], en: [ [Object], [Object] ] } }
    })
    .catch(err => {
      throw err;
    })
```

### Download the file
```javascript

  const directory = './';
  const filename = 'subtitle.srt';
  const addLanguage = true; // add the language at the end of the filename - default true

  // Subtitle is one of the results of .getSubtitles()
  DragandSubtitles.download(subtitle, directory, filename, addLanguage)
    .then( filepath => {
      console.log(filepath);
    })
```

#### Necessary parameters

- Serie - Necessary Parameters to search TVshow subtitles

| API (slug)  | title | episode | season | releaseGroup | imdbId | fileName | filePath |
| :--  | :--: | :--: | :--: | :--: | :--: | :--: | --: |
| Addic7ed (addic7ed)  | &#10004; | &#10004; | &#10004; | &#10004; | | | |
| Open Subtitle (open-subtitles) | | &#10004; | &#10004; | | &#10004; | &#10004; | &#10004; |
| Podnapisi (podnapisi) | &#10004; | &#10004; | &#10004; | |  |  | |
| TheSubDB (thesubdb) | | | | | |  | &#10004; |

- Movie - Necessary Parameters to search movie subtitles

| API (slug)  | title | imdbId | fileName | filePath |
| :--  | :--: | :--: | :--: | :--: | :--: | :--: | --: |
| Open Subtitle (open-subtitles)  | | &#10004; | &#10004; | &#10004; |
| Podnapisi (podnapisi) | &#10004; | | | |
| TheSubDB (thesubdb)  | | |  | &#10004; |
| Yifi  (yifi)  | | &#10004; | | | |
