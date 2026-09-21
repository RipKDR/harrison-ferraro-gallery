import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('dist/client',{recursive:true});cpSync('out','dist/client',{recursive:true});
